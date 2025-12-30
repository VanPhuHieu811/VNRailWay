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