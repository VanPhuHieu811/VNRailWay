import axiosClient from '../api/client';

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