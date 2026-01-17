import client from '../api/client';

const ENDPOINT = '/api/v1/promotions';

// GET: Lấy danh sách ưu đãi
export const getPromotions = async (searchTerm = '') => {
    // If search term exists, append it to query
    const url = searchTerm ? `${ENDPOINT}?search=${searchTerm}` : ENDPOINT;
    return await client.get(url);
};

// POST: Thêm ưu đãi mới
export const createPromotion = async (data) => {
    return await client.post(ENDPOINT, data);
};

// PATCH: Sửa/Cập nhật ưu đãi (dùng cho cả update info và toggle status)
export const updatePromotion = async (id, data) => {
    return await client.patch(`${ENDPOINT}/${id}`, data);
};