import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/staff';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// Lấy danh sách đơn nghỉ phép (cho manager)
export const getLeaveRequests = async (status = 'pending') => {
    const response = await axios.get(`${API_URL}/leave-requests?status=${status}`, getAuthHeader());
    return response.data;
};

// Lấy danh sách nhân viên có thể thay thế (dựa vào chuyến tàu và loại NV)
export const getAvailableStaff = async (maChuyenTau, loaiNV) => {
    const response = await axios.post(`${API_URL}/available-crew`, 
        { maChuyenTau, loaiNV },
        getAuthHeader()
    );
    return response.data.data || response.data;
};

// Duyệt đơn nghỉ phép (chấp nhận)
export const approveLeaveRequest = async (maDon, maNVThayThe) => {
    const response = await axios.patch(`${API_URL}/leave-requests/approve`, 
        { 
            maDon, 
            trangThaiMoi: 'Chấp nhận', 
            maNVThayThe 
        }, 
        getAuthHeader()
    );
    return response.data;
};

// Từ chối đơn nghỉ phép
export const rejectLeaveRequest = async (maDon, reason) => {
    const response = await axios.patch(`${API_URL}/leave-requests/approve`, 
        { 
            maDon, 
            trangThaiMoi: 'Từ chối', 
            maNVThayThe: null
        }, 
        getAuthHeader()
    );
    return response.data;
};
