import { TAI_KHOAN_DB } from './db_mock'; // Import dữ liệu chuẩn

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API Đăng nhập
export const loginUser = async (loginData) => {
  await delay(800); 

  // Tìm user trong "Database giả" khớp username & password
  const user = TAI_KHOAN_DB.find(
    u => u.TenDangNhap === loginData.username && u.MatKhau === loginData.password
  );

  if (!user) {
    throw new Error("Sai tên đăng nhập hoặc mật khẩu.");
  }

  // Trả về dữ liệu đã map sang chuẩn JSON để Frontend dùng
  return {
    status: 200,
    message: "Đăng nhập thành công!",
    data: {
      id: user.MaTK,
      fullName: user.HoTen,
      role: user.VaiTro, // Giá trị sẽ là: 'quản trị', 'nhân viên', hoặc 'khách hàng'
      token: "mock-jwt-token-xyz"
    }
  };
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