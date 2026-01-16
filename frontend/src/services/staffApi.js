import client from '../api/client';

export const getAllStaffService = async () => {
  return await client.get('/api/v1/staff/all');
};

export const getMyProfileService = async () => {
  const employeeData = JSON.parse(localStorage.getItem('employee'));
  const maNV = employeeData?.maNV;
  return await client.get('/api/v1/staff/me', {
    headers: { 'x-staff-id': maNV } 
  });
};

export const getMyScheduleService = async (tuNgay, denNgay) => {
  const employeeData = JSON.parse(localStorage.getItem('employee'));
  const maNV = employeeData?.maNV; 

  if (!maNV) {
    throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
  }


  return await client.get('/api/v1/staff/me/schedule', {
    params: {
      tuNgay: tuNgay,
      denNgay: denNgay
    },
    headers: {
      'x-staff-id': maNV 
    }
  });
};

export const getMyLeaveHistoryService = async () => {
  const employeeData = JSON.parse(localStorage.getItem('employee'));
  const maNV = employeeData?.maNV;

  if (!maNV) throw new Error("Chưa đăng nhập");

  return await client.get('/api/v1/staff/me/leave-history', {
    headers: { 'x-staff-id': maNV }
  });
};

// 2. Tạo đơn nghỉ phép mới
export const createLeaveRequestService = async (maPhanCong, lyDo) => {
  const employeeData = JSON.parse(localStorage.getItem('employee'));
  const maNV = employeeData?.maNV;

  if (!maNV) throw new Error("Chưa đăng nhập");

  return await client.post('/api/v1/staff/me/leave-requests', 
    { 
      maPhanCong, 
      lyDo 
    },
    {
      headers: { 'x-staff-id': maNV }
    }
  );
};

export const getMyPayslipsService = async (thang, nam) => {
  // 1. Lấy thông tin nhân viên đang đăng nhập
  const employeeData = JSON.parse(localStorage.getItem('employee'));
  const maNV = employeeData?.maNV;

  if (!maNV) throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");

  // Gọi API lấy bảng lương
  return await client.get('/api/v1/staff/me/payslips', {
    params: {
      thang: thang,
      nam: nam
    },
    headers: { 'x-staff-id': maNV }
  });
};

export const getStaffScheduleService = async (staffId, tuNgay, denNgay) => {
  return await client.get('/api/v1/staff/me/schedule', {
    params: {
      tuNgay: tuNgay,
      denNgay: denNgay
    },
    headers: {
      'x-staff-id': staffId 
    }
  });
};

export const updateMyProfileService = async (data) => {
  return await client.put('/api/v1/staff/me', data);
};