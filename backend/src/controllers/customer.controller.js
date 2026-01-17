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
    }
};

export default customerController;