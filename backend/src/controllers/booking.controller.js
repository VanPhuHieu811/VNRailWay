import sql from 'mssql';
import { getPool } from '../config/sqlserver.config.js'; 

const bookingController = {
  // Hàm xử lý API đặt vé (Lost Update)
  datVeLostUpdate: async (req, res) => {
    try {
      const { maKhachHang, maChuyenTau, maViTri, maDatVe, maBangGia } = req.body;

      console.log(`[REQ] ${maKhachHang} đang yêu cầu đặt vé...`);

      // 1. Lấy kết nối từ Pool (được export từ file config của bạn)
      const pool = await getPool();

      // 2. Gọi Stored Procedure
      const result = await pool.request()
        .input('MaKhachHang', sql.VarChar(10), maKhachHang)
        .input('MaChuyenTau', sql.VarChar(10), maChuyenTau)
        .input('MaViTri', sql.VarChar(10), maViTri)
        .input('MaDatVe', sql.VarChar(10), maDatVe)
        .input('MaBangGia', sql.VarChar(10), maBangGia)
        .execute('sp_DatVe_LostUpdate'); // Tên SP trong SQL Server

      // 3. Trả về kết quả
      // Với Lost Update, cả 2 request sẽ đều nhận được thông báo thành công này
      return res.status(200).json({
        success: true,
        message: `Đặt vé thành công cho ${maKhachHang}`,
        data: result.recordset
      });

    } catch (error) {
      console.error(`[ERROR] Lỗi đặt vé của ${req.body.maKhachHang}:`, error.message);
      
      // Trả về lỗi 500 nếu có vấn đề (VD: Lỗi kết nối, lỗi logic SP...)
      return res.status(500).json({
        success: false,
        message: 'Giao dịch thất bại',
        error: error.message
      });
    }
  }
};

export default bookingController;