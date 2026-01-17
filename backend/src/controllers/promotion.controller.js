import { getPromotionsService, createPromotionService, updatePromotionService } from '../services/promotion.service.js';

export const getPromotions = async (req, res, next) => {
    try {
        // Get 'keyword' from query params (e.g., ?search=Tet)
        const keyword = req.query.search || null;
        
        const promotions = await getPromotionsService(keyword);
        return res.status(200).json({ 
            success: true, 
            message: 'Get promotions successfully', 
            data: promotions 
        });
    } catch (error) {
        next(error);
    }   
}

export const createPromotion = async (req, res, next) => {
    try {
        const { loaiUuDai, moTa, doiTuong, phanTram, ngayBatDau, ngayKetThuc, trangThai } = req.body;

        // Basic Validation
        if (!loaiUuDai) {
            return res.status(400).json({ success: false, message: 'Missing required field: loaiUuDai'});
        }
        if (phanTram === undefined || phanTram < 0 || phanTram > 100) {
            return res.status(400).json({ success: false, message: 'Invalid field: phanTram (0-100)'});
        }
        if (!ngayBatDau) {
            return res.status(400).json({ success: false, message: 'Missing required field: ngayBatDau'});
        }
        if (!trangThai) {
            return res.status(400).json({ success: false, message: 'Missing required field: trangThai'});
        }

        const result = await createPromotionService({ 
            loaiUuDai, moTa, doiTuong, phanTram, ngayBatDau, ngayKetThuc, trangThai 
        });

        return res.status(201).json({ success: true, ...result });

    } catch (error) {
        next(error);
    }
};

export const updatePromotion = async (req, res, next) => {
    try {
        const promoId = req.params.id;
        const updateData = req.body;

        // Check if body is empty
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update provided' });
        }

        const result = await updatePromotionService(promoId, updateData);
        
        return res.status(200).json({ 
            success: true, 
            ...result 
        });
    } catch (error) {
        next(error);
    }
};