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

// duyet don nghi phep - lost update
export const approveLeaveRequestLost = async (maDon, maNVThayThe) => {
    const response = await axios.patch(`${API_URL}/leave-requests/approve`, 
        { 
            maDon, 
            maNVThayThe 
        }, 
        getAuthHeader()
    );
    return response.data;
};

// duyet don nghi phep - fix lost update
export const approveLeaveRequestFixed = async (maDon, maNVThayThe) => {
    const response = await axios.patch(`${API_URL}/leave-requests/approve/fix-lost-update`, 
        { 
            maDon, 
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

// ... Các hàm cũ giữ nguyên ...

// API Mới: Duyệt Dirty Read (Lỗi)
export const approveLeaveRequestDirtyRead = async (requestId, replacementId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/approve-leave/dirty-read`, {
        maDon: requestId,
        maNVThayThe: replacementId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// API Mới: Duyệt Fixed Dirty Read (An toàn)
export const approveLeaveRequestFixedDirtyRead = async (requestId, replacementId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/approve-leave/fixed`, {
        maDon: requestId,
        maNVThayThe: replacementId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
