import {
    getStaffByEmailService,
    updateStaffService,
    deleteStaffService,
    getAllStaffService,
} from '../services/staff.service.js';

export const getCurrentStaff = async (req, res) => {
    try {
        const emailStaff = req.user.email;
        const staff = await getStaffByEmailService(emailStaff);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: staff,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const emailStaff = req.user.email;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No data provided to update',
            });
        }

        const updatedStaff = await updateStaffService(emailStaff, updateData);

        if (!updatedStaff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found',
            });
        }

        if (updatedStaff.updated === false) {
            return res.status(400).json({
                success: false,
                message: updatedStaff.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Staff updated successfully',
            data: updatedStaff,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const emailStaff = req.user.email;
        const result = await deleteStaffService(emailStaff);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found or already deleted',
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getAllStaff = async (req, res) => {
  try {
    const staff = await getAllStaffService();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

import * as staffService from '../services/staff.service.js';

export const getMySchedule = async (req, res) => {
  try {
    const maNV = req.user?.maNV; 
    if (!maNV) return res.status(401).json({ success: false, message: 'Không xác định được thông tin nhân viên' });
    
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
    const maNV = req.user?.maNV; 
    if (!maNV) return res.status(401).json({ success: false, message: 'Không xác định được thông tin nhân viên' });

    const { thang, nam } = req.query; // Nhận từ các ô chọn trên UI
    console.log(maNV, thang, nam);
    if (!thang || !nam) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tháng và năm.' });
    }

    const data = await staffService.getPayslipsFromDB(maNV, parseInt(thang), parseInt(nam));
    
    // if (!data) {
    //   return res.status(200).json({ success: true, data});
    // }
    console.log(data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm/Cập nhật trong src/controllers/staff.controller.js
export const postLeaveRequest = async (req, res) => {
  try {
    const maNV = req.user?.maNV; 
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
    const maNV = req.user?.maNV;
    if (!maNV) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không xác định được thông tin nhân viên.' 
      });
    }

    const history = await staffService.getLeaveHistory(maNV);

    res.status(200).json({ 
      success: true, 
      data: history 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API cho manager xem tất cả đơn nghỉ phép (dùng lại service từ leave)
export const getAllLeaveRequests = async (req, res) => {
  const { status } = req.query; // 'pending', 'history', hoặc undefined (all)

  try {
    const data = await staffService.getLeaveRequestsService(status);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn nghỉ phép' });
  }
};

export const patchApproveLeave = async (req, res) => {
  try {
    const maNVQuanLy = req.user?.maNV;
    const { maDon, maNVThayThe } = req.body;

    if (!maNVQuanLy) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không xác định được thông tin người duyệt.' 
      });
    }

    if (!maDon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin mã đơn.' 
      });
    }

    await staffService.approveLeaveRequest({ 
      maDon, 
      maNVQuanLy,  
      maNVThayThe 
    });

    res.status(200).json({ 
      success: true, 
      message: `Xử lý đơn ${maDon} thành công.` 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const fixLostUpdateApprove = async (req, res) => {
  try {
    const maNVQuanLy = req.user?.maNV;
    const { maDon, maNVThayThe } = req.body;

    if (!maNVQuanLy) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không xác định được thông tin người duyệt.' 
      });
    }

    if (!maDon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin mã đơn.' 
      });
    }

    await staffService.fixLostUpdateApprove({ 
      maDon, 
      maNVQuanLy,  
      maNVThayThe 
    });

    res.status(200).json({ 
      success: true, 
      message: `Xử lý đơn ${maDon} thành công.` 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
