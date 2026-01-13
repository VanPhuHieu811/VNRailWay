import { TAI_KHOAN_DB, NHAN_VIEN_DB, KHACH_HANG_DB } from './db_mock';

export const loginUser = (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Tìm trong bảng Tài Khoản
      const account = TAI_KHOAN_DB.find(
        acc => acc.username === credentials.username && acc.password === credentials.password
      );

      if (!account) {
        return reject(new Error("Tên đăng nhập hoặc mật khẩu không đúng!"));
      }

      let userInfo = {};
      let finalRole = "";

      // 2. Join bảng để lấy thông tin chi tiết
      if (account.vaiTro === 'NHAN_VIEN') {
        const employee = NHAN_VIEN_DB.find(nv => nv.maNhanVien === account.refID);
        if (employee) {
          userInfo = { ...employee };
          finalRole = employee.loaiNhanVien; // Lấy role cụ thể: MANAGER, SALES, CREW
        }
      } else {
        const customer = KHACH_HANG_DB.find(kh => kh.maKhachHang === account.refID);
        if (customer) {
          userInfo = { ...customer };
          finalRole = 'CUSTOMER';
        }
      }

      // 3. Trả về dữ liệu đã gộp
      resolve({
        data: {
          token: "mock-jwt-token-123456",
          id: account.refID,
          username: account.username,
          fullName: userInfo.hoTen,
          role: finalRole, // Role cuối cùng dùng để điều hướng
          ...userInfo
        }
      });

    }, 800); // Giả lập độ trễ mạng
  });
};

// API Đăng ký (Cập nhật để check trùng với DB chuẩn)
export const registerUser = async (data) => {
  await delay(1000);

  // Check trùng Username
  const isUserExist = TAI_KHOAN_DB.some(u => u.TenDangNhap === data.username);
  if (isUserExist) throw new Error("Tên đăng nhập đã tồn tại.");

  // Check trùng CMND
  const isCMNDExist = TAI_KHOAN_DB.some(u => u.CMND === data.cmnd);
  if (isCMNDExist) throw new Error("CMND/CCCD đã tồn tại.");

  return {
    status: 200,
    message: "Đăng ký thành công!",
    data: { ...data, role: 'khách hàng' } // Mặc định đăng ký mới là khách hàng
  };
};


/**
 * Hàm kiểm tra vé dựa trên Mã vé và CCCD hành khách
 * @param {string} ticketCode - Mã vé (ví dụ: "TK1763952793154")
 * @param {string} passengerCCCD - Số CCCD/CMND của hành khách
 * @returns {object|null} - Trả về thông tin vé và ghế tìm thấy, hoặc null nếu không khớp
 */
export const checkTicketByCodeAndCCCD = (ticketCode, passengerCCCD) => {
  // 1. Tìm vé có mã khớp
  const foundTicket = VE_DA_DAT_DB.find(ticket => ticket.maVe === ticketCode);

  if (!foundTicket) {
    return null; // Không tìm thấy mã vé
  }

  // 2. Tìm trong danh sách ghế của vé đó xem có hành khách nào trùng CCCD không
  const foundSeat = foundTicket.seats.find(seat => seat.passengerID === passengerCCCD);

  if (foundSeat) {
    // Trả về dữ liệu bao gồm thông tin vé chung và thông tin ghế/hành khách cụ thể
    return {
      ticketInfo: foundTicket, // Toàn bộ thông tin vé
      seatInfo: foundSeat      // Thông tin ghế và hành khách khớp CCCD
    };
  }

  return null; // Có mã vé nhưng không có hành khách nào trùng CCCD trong vé đó
};