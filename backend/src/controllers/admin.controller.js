import adminService from '../services/admin.service.js';

const adminController = {
    createSchedule: async (req, res) => {
        try {
            // Lấy thêm gaXuatPhat, gaKetThuc từ request body
            const { maTuyenTau, maDoanTau, ngayKhoiHanh, gaXuatPhat, gaKetThuc } = req.body;

            // Validate dữ liệu
            if (!maTuyenTau || !maDoanTau || !ngayKhoiHanh || !gaXuatPhat || !gaKetThuc) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đủ: Mã tuyến, Đoàn tàu, Ngày khởi hành, Ga đi, Ga đến.'
                });
            }

            const result = await adminService.createScheduleService({
                maTuyenTau,
                maDoanTau,
                ngayKhoiHanh,
                gaXuatPhat,
                gaKetThuc
            });

            return res.status(201).json({
                success: true,
                message: 'Thêm chuyến tàu thành công!',
                data: result.data
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }
};

export default adminController;