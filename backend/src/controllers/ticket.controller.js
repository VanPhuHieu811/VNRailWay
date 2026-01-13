import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js';

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

export default ticketController;