import { getPromotionsService,
     createPromotionService,
     updatePromotionService,
     getPromotionById
    } from '../services/promotion.service.js';

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

export const getDetailPromotion = async (req, res) => {
    try {
        const { maUuDai } = req.body;

        if (!maUuDai) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng cung cấp mã ưu đãi (maUuDai)" 
            });
        }
        
        const result = await getPromotionById(maUuDai);

        if (!result.lan1 && !result.lan2) {
            return res.status(404).json({
                success: false,
                message: "Mã ưu đãi không tồn tại."
            });
        }

        const phanTramLan1 = result.lan1 ? result.lan1.PhanTram : 0;
        const phanTramLan2 = result.lan2 ? result.lan2.PhanTram : 0;
        console.log("Lan 1:", phanTramLan1); 
        console.log("Lan 2:", phanTramLan2);
        const isConflict = phanTramLan1 !== phanTramLan2;

        if (isConflict) {
            return res.status(200).json({
                success: true,
                isUnrepeatableRead: true, 
                message: `Cảnh báo: Mức ưu đãi đã thay đổi từ ${phanTramLan1}% thành ${phanTramLan2}% trong khi hệ thống đang xử lý.`,
                data: {
                    phanTramCu: phanTramLan1,
                    phanTramMoi: phanTramLan2
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                isUnrepeatableRead: false,
                message: "Áp dụng ưu đãi thành công",
                data: {
                    phanTramMoi: phanTramLan2
                }
            });
        }

    } catch (error) {
        console.error("Lỗi Controller applyPromotionDemo:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống: " + error.message
        });
    }
}