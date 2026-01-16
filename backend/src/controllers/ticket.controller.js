import { findTicketForExchangeService } from '../services/ticket.service.js';

export const searchTicketForExchange = async (req, res) => {
    try {
        const { ticketCode, cccd } = req.body;

        if (!ticketCode || !cccd) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập Mã vé và CCCD' });
        }

        const data = await findTicketForExchangeService(ticketCode, cccd);

        if (!data) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy vé hợp lệ hoặc thông tin không khớp.' });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};