import customerService from '../services/customer.service.js';

const customerController = {
    // [GET] /api/v1/schedules/search
    searchSchedules: async (req, res) => {
        try {
            // Lấy tham số từ URL Query (VD: ?from=Hà Nội&to=Sài Gòn&date=2025-12-24)
            const { date, from, to, time } = req.query;

            // Validate dữ liệu bắt buộc
            if (!date || !from || !to) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp đủ: Ngày đi (date), Ga đi (from), Ga đến (to).'
                });
            }

            console.log(`[CUSTOMER] Đang tìm vé từ ${from} đi ${to} ngày ${date}... (Vui lòng đợi 10s)`);

            // Gọi Service
            const data = await customerService.searchSchedulesService(date, from, to, time);

            // Kiểm tra xem có bị Phantom Read không (Số lượng bản ghi khác nhau)
            const count1 = data.lan1.length;
            const count2 = data.lan2.length;
            const isPhantom = count1 !== count2;

            return res.status(200).json({
                success: true,
                message: isPhantom 
                    ? '⚠️ PHÁT HIỆN PHANTOM READ: Dữ liệu thay đổi trong khi đang xem!' 
                    : 'Dữ liệu nhất quán (Hoặc không có ai thêm mới lúc này).',
                phantomDetected: isPhantom,
                data: {
                    lan1_TruocKhiCho: data.lan1,
                    lan2_SauKhiCho: data.lan2
                }
            });

        } catch (error) {
            console.error('[SEARCH ERROR]:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm chuyến tàu',
                error: error.message
            });
        }
    },

    getSeats: async (req, res) => {
        try {
            const { tripId } = req.params;
            const data = await customerService.getSeatMap(tripId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    submitPayment: async (req, res) => {
        try {
            // Dữ liệu Frontend gửi lên phải đúng format này
            const { 
                tripId, 
                buyerInfo, // Object: { HoTen, CCCD, SDT, ... }
                passengers, // Array: [{ MaViTri, HoTen, DoiTuong, GiaCoBan }]
                paymentMethod, gaDi, gaDen 
            } = req.body;

            // Validate sơ bộ
            if (!tripId || !buyerInfo || !buyerInfo.HoTen || !passengers || passengers.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Thiếu thông tin bắt buộc (Người đặt hoặc Hành khách)" 
                });
            }

            const result = await customerService.processPayment({
                tripId,
                buyerInfo,
                passengers,
                paymentMethod,
                gaDi,
                gaDen
            });

            return res.status(200).json({
                success: true,
                message: "Thanh toán và xuất vé thành công!",
                data: result
            });

        } catch (error) {
            console.error("API /payment error:", error);
            if (error.originalError) {
                console.error("SQL:", error.originalError.message);
            }

            res.status(500).json({
                success: false,
                message: error.originalError?.message || error.message
            });
        }
    }
};

export default customerController;