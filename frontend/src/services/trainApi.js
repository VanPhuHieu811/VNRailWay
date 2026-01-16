import axiosClient from '../api/client';
const BASE_URL = '/api/v1/trains';

// 1. Lấy lịch trình (có lọc trạng thái)
export const getTrainScheduleApi = async (status) => {
    return await axiosClient.get('/api/v1/trains/schedule', { params: { status } });
};

// 2. Lấy Timeline chi tiết (Các ga và giờ)
export const getTripTimelineApi = async (tripId) => {
    return await axiosClient.get(`/api/v1/trains/schedule/${tripId}/timeline`);
};

// 3. Cập nhật giờ thực tế
export const updateTripTimeApi = async (tripId, data) => {
    // data: { stationId, actArr, actDep }
    return await axiosClient.put(`/api/v1/trains/schedule/${tripId}/timeline`, data);
};

// 4. Lấy danh sách chuyến chưa phân công
export const getUnassignedTripsApi = async () => {
    return await axiosClient.get('/api/v1/trains/assignments/unassigned');
};

// 5. Lấy chi tiết phân công hiện tại của 1 chuyến
export const getTripAssignmentsApi = async (tripId) => {
    return await axiosClient.get(`/api/v1/trains/assignments/${tripId}`);
};

// 6. Thực hiện phân công (Gọi sang Staff Controller)
export const assignStaffApi = async (data) => {
    // data: { maNV, maChuyenTau, vaiTro, maToa }
    return await axiosClient.post('/api/v1/staff/assignments', data);
};

// 7. Lấy danh sách nhân viên khả dụng (Gọi sang Staff Controller)
export const getAvailableStaffApi = async (maChuyenTau, loaiNV) => {
    return await axiosClient.get('/api/v1/staff/available-crew', { 
        params: { maChuyenTau, loaiNV } 
    });
};
// 8. Tạo lịch trình chuyến mới 
export const createScheduleApi = async (data) => {
    return await axiosClient.post('/api/v1/admin/schedules', data);
};

// 9. Lấy tất cả Tuyến tàu
export const getAllRoutesApi = async () => {
    return await axiosClient.get('/api/v1/routes');
};

// 10. Lấy tất cả Đoàn tàu
export const getAllTrainsApi = async () => {
    return await axiosClient.get('/api/v1/trains');
};

export const getStationsByRouteApi = async (routeId) => {
    return await axiosClient.get(`/api/v1/master/stations/${routeId}`);
};



// --- Train Endpoints ---

export const getAllTrainsService = async () => {
  return await client.get(`${BASE_URL}`);
};

export const getTrainByIdService = async (id) => {
  return await client.get(`${BASE_URL}/${id}`);
};

export const createTrainService = async (data) => {
  return await client.post(`${BASE_URL}`, data);
};

export const updateTrainService = async (id, data) => {
  return await client.patch(`${BASE_URL}/${id}`, data);
};

// --- Carriage Endpoints ---

export const getTrainCarriagesService = async (trainId) => {
  return await client.get(`${BASE_URL}/${trainId}/carriages`);
};

export const createCarriageService = async (data) => {
  return await client.post(`${BASE_URL}/carriages`, data);
};

export const updateCarriageService = async (carriageId, data) => {
  return await client.patch(`${BASE_URL}/carriages/${carriageId}`, data);
};