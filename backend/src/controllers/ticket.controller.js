import { findTicketForExchangeService, confirmExchangeTicket} from '../services/ticket.service.js';
import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';

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


const ticketController = {
  // API: GET /api/v1/tickets/:code
  getTicketDetail: async (req, res) => {
    try {
      const { code } = req.params; // Lấy mã vé từ URL

      console.log(`[REQ] Tra cứu vé mã: ${code}`);

      const pool = await getPool();
      const result = await pool.request()
        .input('MaVe', sql.VarChar(50), code)
        .execute('sp_TraCuuVe'); // Gọi Store Procedure sp_TraCuuVe

      // Kiểm tra nếu không tìm thấy vé
      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy vé hoặc mã vé không hợp lệ.',
        });
      }

      // Trả về dữ liệu vé (Lấy dòng đầu tiên)
      return res.status(200).json({
        success: true,
        data: result.recordset[0],
      });

    } catch (error) {
      console.error('[ERROR] Tra cứu vé:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tra cứu vé.',
        error: error.message,
      });
    }
  },
};

export const processExchange = async (req, res) => {
    try {
        const exchangeData = req.body;

        // Validate cơ bản
        if (!exchangeData.oldTicketCode || !exchangeData.newTripId || !exchangeData.newSeatId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu thông tin vé cũ hoặc vé mới.' 
            });
        }

        // Validate thông tin khách
        if (!exchangeData.passengerName || !exchangeData.passengerID) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu thông tin hành khách (Tên, CCCD).' 
            });
        }

        const result = await confirmExchangeTicket(exchangeData);
        
        return res.status(200).json({
            success: true,
            message: 'Đổi vé thành công!',
            data: result // Trả về: MaVeMoi, MaDoiVe, TongTienThanhToan...
        });

    } catch (error) {
        console.error("API Error:", error);
        // Bắt lỗi từ RAISERROR trong SQL
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Lỗi server khi xử lý đổi vé.' 
        });
    }
};

export default ticketController;
