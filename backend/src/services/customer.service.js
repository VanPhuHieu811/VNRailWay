import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';
import { generateId } from '../utils/idGenerator.js';
const mapStatusToFrontend = (statusDb) => {
    if (!statusDb) return 'processing';
    
    const s = statusDb.toLowerCase();
    
    // Nếu DB lưu "Đã hủy" hoặc "Cancelled"
    if (s.includes('hủy') || s.includes('cancelled')) {
        return 'cancelled';
    }
    
    // Nếu DB lưu "Đã đi", "Hoàn thành"
    if (s.includes('đã đi') || s.includes('hoàn thành')) {
        return 'used';
    }
    
    // Nếu DB lưu "Đã thanh toán", "Đã đặt" -> Trả về active để frontend hiện "Sắp khởi hành"
    if (s.includes('thanh toán') || s.includes('đã đặt')) {
        return 'active';
    }

    // Mặc định
    return 'processing';
};

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
                dt.TenTau,
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
            
            // =========================================================================
            // BƯỚC 1: TẠO ĐƠN ĐẶT VÉ (DAT_VE) - Gắn với EMAIL NGƯỜI ĐẶT
            // =========================================================================
            const maDatVe = await generateId('DAT_VE', 'MaDatVe', 'DV', 3);
            const thoiGianDat = new Date();
            const hanThanhToan = new Date(thoiGianDat.getTime() + 30 * 60000); // +30 phút

            const reqDatVe = new sql.Request(transaction);
            reqDatVe.input('MaDatVe', sql.VarChar(20), maDatVe);
            reqDatVe.input('ThoiGianDat', sql.DateTime, thoiGianDat);
            // EMAIL người đặt lưu ở đây để gửi vé
            reqDatVe.input('Email', sql.VarChar(50), paymentData.buyerInfo.Email || null); 
            reqDatVe.input('MaChuyenTau', sql.VarChar(20), paymentData.tripId);
            reqDatVe.input('HanThanhToan', sql.DateTime, hanThanhToan);
            
            await reqDatVe.query(`
                INSERT INTO DAT_VE (MaDatVe, MaChuyenTau, Email, ThoiGianDat, HanThanhToan, TrangThai, KenhDat)
                VALUES (@MaDatVe, @MaChuyenTau, @Email, @ThoiGianDat, @HanThanhToan, N'Đã thanh toán', 'Online')
            `);

            // =========================================================================
            // CHUẨN BỊ ID ĐỂ TỰ TĂNG (Tránh lỗi trùng lặp trong vòng lặp)
            // =========================================================================
            
            // 1. Chuẩn bị ID cho VÉ (VE...)
            let baseMaVe = await generateId('VE_TAU', 'MaVe', 'VE', 3); 
            let currentVeNum = parseInt(baseMaVe.replace('VE', ''), 10);

            // 2. Chuẩn bị ID cho KHÁCH HÀNG (KH...) - Phòng trường hợp cần tạo mới nhiều KH
            // Lưu ý: generateId trả về ID kế tiếp khả dụng
            let baseMaKh = await generateId('KHACH_HANG', 'MaKhachHang', 'KH', 3);
            let currentKhNum = parseInt(baseMaKh.replace('KH', ''), 10);
            
            // Biến đếm số lượng khách hàng MỚI được tạo trong transaction này
            let newCustomerCount = 0; 

            // =========================================================================
            // BƯỚC 2: DUYỆT TỪNG HÀNH KHÁCH -> XỬ LÝ KHÁCH HÀNG -> TẠO VÉ
            // =========================================================================
            let tongTienThuc = 0;

            for (let i = 0; i < paymentData.passengers.length; i++) {
                const p = paymentData.passengers[i];
                let maKhachHangCuaNguoiDi = '';

                // --- 2.1: KIỂM TRA KHÁCH HÀNG (NGƯỜI ĐI) ĐÃ CÓ TRONG DB CHƯA? ---
                // Ưu tiên check theo CCCD, nếu không có CCCD thì check theo gì đó tùy nghiệp vụ (ở đây bắt buộc CCCD với người lớn)
                // Nếu là trẻ em không có CCCD thì có thể phải dùng logic khác, nhưng ở đây giả sử check CCCD hoặc tạo mới luôn.
                
                const checkKhRequest = new sql.Request(transaction);
                // Với hành khách, CCCD là quan trọng nhất để định danh
                checkKhRequest.input('CCCD', sql.VarChar(20), p.CCCD || ''); 
                
                // Chỉ check nếu có CCCD, nếu trẻ em ko CCCD thì coi như tạo mới (hoặc handle riêng)
                let existingKh = null;
                if (p.CCCD) {
                    const checkResult = await checkKhRequest.query(`
                        SELECT MaKhachHang FROM KHACH_HANG WHERE CCCD = @CCCD
                    `);
                    if (checkResult.recordset.length > 0) {
                        existingKh = checkResult.recordset[0];
                    }
                }

                if (existingKh) {
                    // CASE A: Đã có khách hàng này -> Lấy ID cũ & Update thông tin
                    maKhachHangCuaNguoiDi = existingKh.MaKhachHang;
                    
                    const updateKh = new sql.Request(transaction);
                    updateKh.input('MaKhachHang', maKhachHangCuaNguoiDi);
                    updateKh.input('HoTen', sql.NVarChar(50), p.HoTen);
                    // Update Họ tên mới nhất
                    await updateKh.query(`UPDATE KHACH_HANG SET HoTen = @HoTen WHERE MaKhachHang = @MaKhachHang`);

                } else {
                    // CASE B: Khách hàng chưa tồn tại -> TẠO MỚI
                    // Tính toán ID mới thủ công để không trùng trong vòng lặp
                    let num = currentKhNum + newCustomerCount;
                    maKhachHangCuaNguoiDi = `KH${String(num).padStart(3, '0')}`;
                    newCustomerCount++; // Tăng biến đếm để người sau lấy số tiếp theo

                    const insertKhRequest = new sql.Request(transaction);
                    insertKhRequest.input('MaKhachHang', sql.VarChar(20), maKhachHangCuaNguoiDi);
                    insertKhRequest.input('HoTen', sql.NVarChar(50), p.HoTen);
                    insertKhRequest.input('CCCD', sql.VarChar(20), p.CCCD || null);
                    insertKhRequest.input('NgaySinh', sql.Date, p.NgaySinh || null);
                    // Các trường này hành khách có thể không có, để null hoặc rỗng
                    insertKhRequest.input('DiaChi', sql.NVarChar(100), ''); 
                    insertKhRequest.input('SoDienThoai', sql.VarChar(15), ''); 

                    await insertKhRequest.query(`
                        INSERT INTO KHACH_HANG (MaKhachHang, HoTen, CCCD, NgaySinh, DiaChi, SoDienThoai, GioiTinh)
                        VALUES (@MaKhachHang, @HoTen, @CCCD, @NgaySinh, @DiaChi, @SoDienThoai, 'Nam')
                    `);
                }

                // --- 2.2: TẠO VÉ (VE_TAU) CHO KHÁCH HÀNG NÀY ---
                
                // Tự tăng ID Vé
                let maVe = baseMaVe;
                if (i > 0) {
                    currentVeNum += 1;
                    maVe = `VE${String(currentVeNum).padStart(3, '0')}`;
                }

                // Tính giá
                let phanTramGiam = 0;
                // if (p.DoiTuong === 'Sinh viên') phanTramGiam = 0.1; 
                // else if (p.DoiTuong === 'Trẻ em') phanTramGiam = 0.25;
                // else if (p.DoiTuong === 'Người cao tuổi') phanTramGiam = 0.15;
                
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
                // [QUAN TRỌNG]: Gán vé cho đúng Mã Khách Hàng của Người Đi
                reqVe.input('MaKhachHang', sql.VarChar(20), maKhachHangCuaNguoiDi); 
                reqVe.input('GaXuatPhat', sql.VarChar(20), paymentData.gaDi);
                reqVe.input('GaDen', sql.VarChar(20), paymentData.gaDen);
                reqVe.input('MaUuDai', sql.VarChar(20), p.MaUuDai);

                await reqVe.query(`
                    INSERT INTO VE_TAU (
                        MaVe, MaKhachHang, MaDatVe, MaChuyenTau, 
                        GaXuatPhat, GaDen, MaViTri, 
                        GiaThuc, MaUuDai,
                        ThoiGianXuatVe, TrangThai
                    )
                    VALUES (
                        @MaVe, @MaKhachHang, @MaDatVe, @MaChuyenTau,
                        @GaXuatPhat, @GaDen, @MaViTri, 
                        @GiaThuc, @MaUuDai,
                        GETDATE(), N'Đã đặt'
                    )
                `);
            }

            // =========================================================================
            // BƯỚC 3: TẠO HÓA ĐƠN & UPDATE TỔNG TIỀN
            // =========================================================================
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

            // Update tổng tiền
            const reqUpdate = new sql.Request(transaction);
            reqUpdate.input('MaDatVe', maDatVe);
            reqUpdate.input('TongTien', tongTienThuc);
            await reqUpdate.query("UPDATE DAT_VE SET TongTienDuKien = @TongTien WHERE MaDatVe = @MaDatVe");

            // --- COMMIT ---
            await transaction.commit(); 
            
            return { success: true, maDatVe, maHoaDon, tongTien: tongTienThuc };

        } catch (error) {
            await transaction.rollback(); 
            console.error("Lỗi Payment Transaction:", error);
            if (error.originalError) {
                console.error("SQL Error:", error.originalError.message);
            }
            throw error;
        }
    },
    getMyTickets: async (email) => {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('Email', sql.VarChar(100), email); 

            const result = await request.execute('sp_LayLichSuDatVe_DirtyRead');
            const flatRows = result.recordset;

            const bookingMap = new Map();

            flatRows.forEach(row => {
                if (!bookingMap.has(row.MaDatVe)) {
                    bookingMap.set(row.MaDatVe, {
                        maVe: row.MaDatVe,
                        ngayDat: row.ThoiGianDat,
                        status: mapStatusToFrontend(row.TrangThaiDatVe),
                        totalPrice: row.TongTienDuKien,
                        email: row.Email,
                        
                        contactInfo: {
                            hoTen: row.HoTen,
                            sdt: row.SoDienThoai
                        },

                        tripInfo: {
                            // Dùng Mã chuyến tàu làm tên hiển thị
                            tenTau: row.MaChuyenTau, 
                            gaDi: row.GaXuatPhat,
                            gaDen: row.GaDen,
                            LoaiToa: row.LoaiToa,
                            
                            // Map Giờ đi từ DuKienXuatPhat
                            gioDi: row.DuKienXuatPhat 
                                ? new Date(row.DuKienXuatPhat).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) 
                                : '--:--',
                            gioDen: row.DuKienDen 
                                ? new Date(row.DuKienDen).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) 
                                : '--:--',
                            // Lấy ngày đi từ DuKienXuatPhat
                            ngayDi: row.DuKienXuatPhat 
                                ? new Date(row.DuKienXuatPhat).toISOString().split('T')[0] 
                                : ''
                        },
                        seats: [] 
                    });
                }

                // Push chi tiết vé
                const booking = bookingMap.get(row.MaDatVe);
                booking.seats.push({
                    maVeCon: row.MaVe,
                    seatNum: row.STTViTri,      
                    maToa: row.MaToaTau,
                    tenToa: `Toa ${row.STTToaTau}`, 
                    price: row.GiaThuc,
                    trangThaiVe: row.TrangThaiVe,
                    hanhKhach: row.HoTen
                });
            });

            return Array.from(bookingMap.values());

        } catch (error) {
            console.error("❌ Lỗi getMyTickets:", error);
            throw error;
        }
    },
};



export default customerService;