import { getRevenueReportService } from '../services/report.service.js';

export const getRevenueReport = async (req, res) => {
    try {
        const { type, month, year } = req.query; 

        const validType = ['today', 'week', 'month', 'year'];
        const filterType = validType.includes(type) ? type : 'today';

        const data = await getRevenueReportService(filterType, month, year);

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("Report Error:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy báo cáo doanh thu: ' + error.message
        });
    }
};

export const exportRevenueReport = async (req, res) => {
    try {
        return res.status(501).json({
            success: false,
            message: "Tính năng xuất Excel đang được phát triển."
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};