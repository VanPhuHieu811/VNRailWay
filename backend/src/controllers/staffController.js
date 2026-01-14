import * as staffService from '../services/staffService.js';

// export const getMySchedule = async (req, res) => {
//   try {
//     // Tạm lấy từ Header 'x-staff-id' để bạn test rảnh tay
//     const maNV = req.headers['x-staff-id']; 
//     if (!maNV) return res.status(400).json({ message: 'Thiếu định danh nhân viên' });

//     const data = await staffService.getScheduleFromDB(maNV);
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getMySchedule = async (req, res) => {
  try {
    const maNV = req.headers['x-staff-id']; 
    // Lấy tuNgay và denNgay từ URL: ?tuNgay=2025-11-24&denNgay=2025-11-30
    const { tuNgay, denNgay } = req.query;

    const data = await staffService.getScheduleFromDB(maNV, tuNgay, denNgay);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayslips = async (req, res) => {
  try {
    const maNV = req.headers['x-staff-id']; 
    const { thang, nam } = req.query; // Nhận từ các ô chọn trên UI

    if (!thang || !nam) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tháng và năm.' });
    }

    const data = await staffService.getPayslipsFromDB(maNV, parseInt(thang), parseInt(nam));
    
    // if (!data) {
    //   return res.status(200).json({ success: true, data});
    // }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm/Cập nhật trong src/controllers/staffController.js
export const postLeaveRequest = async (req, res) => {
  try {
    // Lấy mã nhân viên từ Header để định danh người dùng (đúng chuẩn /me)
    const maNV = req.headers['x-staff-id']; 
    const { maPhanCong, lyDo } = req.body;

    if (!maNV || !maPhanCong) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin mã phân công hoặc định danh nhân viên.' 
      });
    }

    await staffService.createLeaveRequest({ maPhanCong, maNV, lyDo });

    res.status(201).json({ 
      success: true, 
      message: 'Gửi đơn nghỉ phép thành công. Hệ thống đã tự động cấp mã đơn mới.' 
    });
  } catch (error) {
    // Bắt các lỗi RAISERROR từ SQL như: "Mã phân công không hợp lệ"
    res.status(400).json({ success: false, message: error.message });
  }
};

// Thêm vào src/controllers/staffController.js
export const postAssignment = async (req, res) => {
  try {
    const { maNV, maChuyenTau, vaiTro, maToa } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!maNV || !maChuyenTau || !vaiTro) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp đầy đủ: Mã NV, Mã chuyến tàu và Vai trò.' 
      });
    }

    await staffService.assignStaffToTrain({ maNV, maChuyenTau, vaiTro, maToa });

    res.status(201).json({ 
      success: true, 
      message: 'Phân công nhân sự thành công.' 
    });
  } catch (error) {
    // Trả về lỗi từ RAISERROR trong SQL (Loại NV không khớp, trùng lịch,...)
    res.status(400).json({ success: false, message: error.message });
  }
};

// Thêm vào src/controllers/staffController.js
export const patchApproveLeave = async (req, res) => {
  try {
    const maNVQuanLy = req.headers['x-staff-id']; // Định danh người quản lý duyệt đơn
    const { maDon, trangThaiMoi, maNVThayThe } = req.body;

    if (!maDon || !trangThaiMoi) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin mã đơn hoặc trạng thái duyệt mới.' 
      });
    }

    await staffService.approveLeaveRequest({ 
      maDon, 
      maNVQuanLy, 
      trangThaiMoi, 
      maNVThayThe 
    });

    res.status(200).json({ 
      success: true, 
      message: `Xử lý đơn ${maDon} thành công: ${trangThaiMoi}.` 
    });
  } catch (error) {
    // Trả về các lỗi RAISERROR từ SQL (VD: Thiếu người thay thế, sai vai trò...)
    res.status(400).json({ success: false, message: error.message });
  }
};

// src/controllers/staffController.js
export const getAvailableStaffList = async (req, res) => {
  try {
    const { maChuyenTau, loaiNV } = req.body;

    if (!maChuyenTau || !loaiNV) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp mã chuyến tàu và loại nhân viên cần tìm.' 
      });
    }

    const staffList = await staffService.getAvailableStaff({ maChuyenTau, loaiNV });

    res.status(200).json({ 
      success: true, 
      data: staffList 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/controllers/staffController.js
export const postCalculateSalary = async (req, res) => {
  try {
    const { thang, nam } = req.body;

    if (!thang || !nam) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp đầy đủ tháng và năm để tính lương.' 
      });
    }

    await staffService.calculateMonthlySalary(parseInt(thang), parseInt(nam));

    res.status(200).json({ 
      success: true, 
      message: `Đã tính xong lương tháng ${thang}/${nam} cho toàn bộ nhân viên.` 
    });
  } catch (error) {
    // Trả về lỗi từ khối CATCH trong SQL (ví dụ lỗi ngày tháng)
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyLeaveHistory = async (req, res) => {
  try {
    const maNV = req.headers['x-staff-id']; // Lấy ID từ header đăng nhập
    const history = await staffService.getLeaveHistory(maNV);

    res.status(200).json({ 
      success: true, 
      data: history 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};