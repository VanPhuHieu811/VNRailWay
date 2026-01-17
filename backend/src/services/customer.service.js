import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';
import { generateId } from '../utils/idGenerator.js';

const customerService = {
    /**
     * Tìm kiếm chuyến tàu (Demo Phantom Read)
     * @param {string} ngayDi - Ngày đi (YYYY-MM-DD)
     * @param {string} gaDi - Tên ga đi (VD: Hà Nội)
     * @param {string} gaDen - Tên ga đến (VD: Sài Gòn)
     * @param {string|null} gioKhoiHanh - Giờ (HH:mm) hoặc null
     */
    searchSchedulesService: async (ngayDi, gaDi, gaDen, gioKhoiHanh) => {
        try {
            const pool = await getPool();
            const request = pool.request();

            // Map tham số
            request.input('NgayDi', sql.Date, ngayDi);
            request.input('GaDi', sql.VarChar(50), gaDi);
            request.input('GaDen', sql.VarChar(50), gaDen);
            
            // Xử lý giờ khởi hành (có thể null)
            if (gioKhoiHanh) {
                request.input('GioKhoiHanh', sql.Time, gioKhoiHanh);
            } else {
                request.input('GioKhoiHanh', sql.Time, null);
            }

            // Gọi SP
            const result = await request.execute('sp_XemDSChuyenTau');

            // SP trả về 2 bảng kết quả (recordsets) do select 2 lần
            return {
                lan1: result.recordsets[0], // Kết quả lần đọc đầu tiên
                lan2: result.recordsets[1]  // Kết quả lần đọc thứ 2 (sau 10s)
            };

        } catch (error) {
            throw error;
        }
    },

    getSeatMap: async(maChuyenTau)=>{
        const pool =await getPool();
        const request = pool.request();
        request.input('MaChuyenTau', sql.VarChar(10),maChuyenTau);
        const query=`
        SELECT 
                tt.MaToaTau, 
                tt.LoaiToa,
                vt.MaViTri, 
                vt.STT AS SoGhe,
                g.Phong,
                g.Tang,
                CASE 
                    WHEN ve.MaVe IS NOT NULL THEN 'Booked' 
                    ELSE 'Available'                       
                END AS TrangThai
            FROM CHUYEN_TAU ct
            JOIN DOAN_TAU dt ON ct.MaDoanTau = dt.MaDoanTau
            JOIN TOA_TAU tt ON dt.MaDoanTau = tt.MaDoanTau
            JOIN VI_TRI_TREN_TOA vt ON tt.MaToaTau = vt.MaToaTau
            LEFT JOIN GIUONG g on g.MaViTri= vt.maViTri
            LEFT JOIN VE_TAU ve ON ve.MaViTri = vt.MaViTri 
                                AND ve.MaChuyenTau = ct.MaChuyenTau
                                AND ve.TrangThai IN (N'Đã đặt', N'Đã thanh toán')
            WHERE ct.MaChuyenTau = @MaChuyenTau
            ORDER BY tt.MaToaTau, vt.STT;
        `;
        const  result =await request. query (query);
        const seatsByCarriage = result.recordset.reduce((acc, item) => {
            const { MaToaTau, TenToa, LoaiToa, ...seatInfo } = item;
            if (!acc[MaToaTau]) {
                acc[MaToaTau] = { MaToaTau, TenToa, LoaiToa, seats: [] };
            }
            acc[MaToaTau].seats.push(seatInfo);
            return acc;
        }, {});
        return Object.values(seatsByCarriage);
    },
    processPayment: async (paymentData) => {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin(); // --- BẮT ĐẦU TRANSACTION ---
            
            // --- BƯỚC 1: XỬ LÝ KHÁCH HÀNG (NGƯỜI ĐẶT VÉ) ---
            let maKhachHang = '';
            
            // Kiểm tra khách hàng đã tồn tại chưa (Dựa vào CCCD hoặc SĐT)
            const checkKhRequest = new sql.Request(transaction);
            checkKhRequest.input('CCCD', sql.VarChar(20), paymentData.buyerInfo.CCCD);
            checkKhRequest.input('SoDienThoai', sql.VarChar(15), paymentData.buyerInfo.SoDienThoai);
            
            const checkKhResult = await checkKhRequest.query(`
                SELECT MaKhachHang FROM KHACH_HANG 
                WHERE CCCD = @CCCD OR SoDienThoai = @SoDienThoai
            `);

            if (checkKhResult.recordset.length > 0) {
                // Nếu đã có -> Lấy mã cũ
                maKhachHang = checkKhResult.recordset[0].MaKhachHang;
                const updateKh = new sql.Request(transaction);
                updateKh.input('MaKhachHang', maKhachHang);
                updateKh.input('HoTen', sql.NVarChar(50), paymentData.buyerInfo.HoTen);
                updateKh.input('SoDienThoai', sql.VarChar(15), paymentData.buyerInfo.SoDienThoai);
                updateKh.input('NgaySinh', sql.Date, paymentData.buyerInfo.NgaySinh || null);
                // ... các trường khác
                await updateKh.query(`
                    UPDATE KHACH_HANG 
                    SET HoTen = @HoTen, SoDienThoai = @SoDienThoai, NgaySinh = @NgaySinh
                    WHERE MaKhachHang = @MaKhachHang
                `);
            } else {
                // Nếu chưa có -> Sinh mã mới (KH001, KH002...)
                // Lưu ý: Trong transaction, ta phải tự tính logic sinh mã cẩn thận hoặc lock bảng. 
                // Để đơn giản ở đây, ta gọi hàm generateId (lưu ý: có thể bị race condition nếu traffic cao, production cần lock)
                maKhachHang = await generateId('KHACH_HANG', 'MaKhachHang', 'KH', 3);

                const insertKhRequest = new sql.Request(transaction);
                insertKhRequest.input('MaKhachHang', sql.VarChar(20), maKhachHang);
                insertKhRequest.input('HoTen', sql.NVarChar(50), paymentData.buyerInfo.HoTen);
                insertKhRequest.input('CCCD', sql.VarChar(20), paymentData.buyerInfo.CCCD);
                insertKhRequest.input('NgaySinh', sql.Date, paymentData.buyerInfo.NgaySinh); // YYYY-MM-DD
                insertKhRequest.input('DiaChi', sql.NVarChar(100), paymentData.buyerInfo.DiaChi);
                insertKhRequest.input('SoDienThoai', sql.VarChar(15), paymentData.buyerInfo.SoDienThoai);

                await insertKhRequest.query(`
                    INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, NgaySinh, DiaChi, SoDienThoai,GioiTinh)
                    VALUES (@MaKhachHang, @HoTen, @CCCD, @NgaySinh, @DiaChi, @SoDienThoai, 'Nam')
                `);
            }

            // --- BƯỚC 2: TẠO ĐƠN ĐẶT VÉ (DAT_VE) ---
            const maDatVe = await generateId('DAT_VE', 'MaDatVe', 'DV', 3); // VD: DV001
            const thoiGianDat = new Date();
            const hanThanhToan = new Date(thoiGianDat.getTime() + 30 * 60000); // Cộng thêm 30 phút

            const reqDatVe = new sql.Request(transaction);
            reqDatVe.input('MaDatVe', sql.VarChar(20), maDatVe);
            reqDatVe.input('ThoiGianDat', sql.DateTime, thoiGianDat);
            reqDatVe.input('Email', sql.VarChar(50), paymentData.buyerInfo.Email || null);
            reqDatVe.input('MaChuyenTau', sql.VarChar(20), paymentData.tripId);
            reqDatVe.input('HanThanhToan', sql.DateTime, hanThanhToan);
            
            // Insert tạm thời, Tổng tiền sẽ update sau hoặc tính luôn nếu có
            await reqDatVe.query(`
                INSERT INTO DAT_VE (MaDatVe,MaChuyenTau,Email, ThoiGianDat, HanThanhToan, TrangThai, KenhDat)
                VALUES (@MaDatVe, @MaChuyenTau, @Email, @ThoiGianDat, @HanThanhToan, N'Đã thanh toán', 'Online')
            `);

            // --- BƯỚC 3: TẠO CHI TIẾT VÉ (VE_TAU) VÀ TÍNH TIỀN ---
            let tongTienThuc = 0;

            for (const p of paymentData.passengers) {
                const maVe = await generateId('VE_TAU', 'MaVe', 'VE', 3); // VD: VE001
                
                // Logic tính giảm giá dựa trên Đối Tượng
                let phanTramGiam = 0;
                // // String so sánh phải khớp với value trong Select Option ở Frontend
                // if (p.DoiTuong.includes('Sinh viên')) phanTramGiam = 0.1; 
                // else if (p.DoiTuong.includes('Trẻ em')) phanTramGiam = 0.25;
                // else if (p.DoiTuong.includes('Người cao tuổi')) phanTramGiam = 0.15;
                
                const giaGoc = p.GiaCoBan;
                const soTienGiam = giaGoc * phanTramGiam;
                const giaThuc = giaGoc - soTienGiam;
                
                tongTienThuc += giaThuc;

                const reqVe = new sql.Request(transaction);
                reqVe.input('MaVe', sql.VarChar(20), maVe);
                reqVe.input('MaDatVe', sql.VarChar(20), maDatVe);
                reqVe.input('MaChuyenTau', sql.VarChar(20), paymentData.tripId);
                reqVe.input('MaViTri', sql.VarChar(20), p.MaViTri);
                reqVe.input('GiaThuc', sql.Decimal(18, 0), giaThuc);
                reqVe.input('SoTienGiam', sql.Decimal(18, 0), soTienGiam);
                reqVe.input('MaKhachHang', sql.VarChar(20), maKhachHang);
                reqVe.input('GaXuatPhat', sql.VarChar(20), paymentData.gaDi);
                reqVe.input('GaDen', sql.VarChar(20), paymentData.gaDen);
                // Lưu tên hành khách vào vé (nếu cần thiết kế bảng VE_TAU có cột TenHanhKhach)
                // reqVe.input('TenHanhKhach', sql.NVarChar(50), p.HoTen); 

                await reqVe.query(`
                    INSERT INTO VE_TAU (MaVe,MaKhachHang,MaDatVe, MaChuyenTau,GaXuatPhat,GaDen, MaViTri, GiaThuc, SoTienGiam,ThoiGianXuatVe, TrangThai)
                    VALUES (@MaVe, @MaKhachHang, @MaDatVe, @MaChuyenTau,@GaXuatPhat,@GaDen, @MaViTri, @GiaThuc, @SoTienGiam, GETDATE(), N'Đã đặt')
                `);
                
                // Cập nhật trạng thái ghế trong VI_TRI (nếu thiết kế cần, nhưng thường dùng Left Join bảng Vé)
            }

            // --- BƯỚC 4: TẠO HÓA ĐƠN & CẬP NHẬT TỔNG TIỀN ---
            const maHoaDon = await generateId('HOA_DON', 'MaHoaDon', 'HD', 3);
            
            const reqHD = new sql.Request(transaction);
            reqHD.input('MaHoaDon', sql.VarChar(20), maHoaDon);
            reqHD.input('MaDatVe', sql.VarChar(20), maDatVe);
            reqHD.input('ThoiGianThanhToan', sql.DateTime, new Date());
            reqHD.input('TongTien', sql.Decimal(18, 0), tongTienThuc);
            reqHD.input('HinhThuc', sql.NVarChar(50), paymentData.paymentMethod || 'Online');

            await reqHD.query(`
                INSERT INTO HOA_DON (MaHoaDon, MaDatVe, ThoiGianThanhToan, HinhThucThanhToan, GiaTien)
                VALUES (@MaHoaDon, @MaDatVe, @ThoiGianThanhToan, 'Online', @TongTien)
            `);

            // Update lại tổng tiền dự kiến vào bảng Đặt Vé
            const reqUpdate = new sql.Request(transaction);
            reqUpdate.input('MaDatVe', maDatVe);
            reqUpdate.input('TongTien', tongTienThuc);
            await reqUpdate.query("UPDATE DAT_VE SET TongTienDuKien = @TongTien WHERE MaDatVe = @MaDatVe");

            await transaction.commit(); 
            
            return { success: true, maDatVe, maHoaDon, tongTien: tongTienThuc };

        } catch (error) {
            await transaction.rollback(); // --- ROLLBACK NẾU LỖI ---
            console.error("Lỗi Payment Transaction:");
            console.error(error);

            if (error.originalError) {
                console.error("SQL Error:", error.originalError.message);
            }
            throw error;
        }
    }
};



export default customerService;