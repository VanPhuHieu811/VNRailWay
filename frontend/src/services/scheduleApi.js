import client from '../api/client';

export const scheduleApi = {
  // --- NHÓM API MASTER DATA (Lấy danh mục để đổ vào Dropdown) ---
  
  // Lấy danh sách Ga tàu (MaGaTau, TenGa)
  getStationsByRoute: (routeId) => client.get(`/api/v1/master/stations/${routeId}`),

  // Lấy danh sách Tuyến tàu (MaTuyenTau, TenTuyen)
  getRoutes: () => client.get('/api/v1/master/routes'),

  // Lấy danh sách Đoàn tàu (MaDoanTau, TenTau)
  getTrains: () => client.get('/api/v1/master/trains'),

  //Lấy danh sách Ga tàu (MaGaTau, TenGa)
  getStations: () => client.get('/api/v1/master/stations'),

  // --- NHÓM API NGHIỆP VỤ ---

  // Thêm mới chuyến tàu & Tính lịch trình tự động
  createSchedule: (data) => {
    // data gồm: { maTuyenTau, maDoanTau, ngayKhoiHanh, gaXuatPhat, gaKetThuc }
    return client.post('/api/v1/admin/schedules', data);
  },
  // Tìm kiếm lịch trình theo ga đi, ga đến, ngày đi
  searchSchedules: (from, to, date, time) => {
    return client.get('/api/v1/schedules/search', {
      params: { from, to, date, time }
    });
  }
};