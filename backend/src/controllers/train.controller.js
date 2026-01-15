import { createTrainService, createCarriageService, getTrainService, getTrainIdService, getCarriagesService, updateTrainService, updateCarriageService } from '../services/train.service.js';
import { AppError } from '../utils/AppError.js';

///////////////////////////////////////////////////////////////////////////////////
// Train 
export const getTrain = async (req, res, next) => {
    try {
        const train = await getTrainService();
        return res.status(200).json({ success: true, message: 'Get trains successfully', data: train });
    } catch (error) {
        next(error);
    }   
}

export const getTrainById = async (req, res, next) => {
    try {
        const trainId = req.params.id;
        const train = await getTrainIdService(trainId);
        return res.status(200).json({ success: true, message: 'Get train successfully', data: train });
    } catch (error) {
        next(error);
    }   
}

export const createTrain = async (req, res, next) => {
    try {
        // Extract data from request body
        const { tenTau, hangSanXuat, ngayVanHanh, loaiTau, trangThai } = req.body;

        // Basic validation
        if (!tenTau) {
            return res.status(400).json({ success: false, message: 'Missing required field: tenTau'});
        }
        if(!loaiTau) {
            return res.status(400).json({ success: false, message: 'Missing required field: loaiTau'});
        }
        if(!hangSanXuat) {
            return res.status(400).json({ success: false, message: 'Missing required field: hangSanXuat'});
        }
        if(!ngayVanHanh) {
            return res.status(400).json({ success: false, message: 'Missing required field: ngayVanHanh'});
        }
        if(!trangThai) {
            return res.status(400).json({ success: false, message: 'Missing required field: trangThai'});
        }

        await createTrainService({ tenTau, hangSanXuat, ngayVanHanh, loaiTau, trangThai });
        return res.status(201).json({ success: true, message: 'Create train successfully'});

    } catch (error) {
        next(error);
    }
};


export const updateTrain = async (req, res, next) => {
    try {
        const trainId = req.params.id;
        const updateData = req.body;
        await updateTrainService(trainId, updateData);
        return res.status(200).json({ success: true, message: 'Update train successfully'});
    } catch (error) {
        next(error);
    }
};

//////////////////////////////////////////////////////////////////////////////
// Carriage
export const getCarriages = async (req, res, next) => {
    try {
        const trainId = req.params.id;
        const carriages = await getCarriagesService(trainId);
        return res.status(200).json({ success: true, message: 'Get carriages successfully', data: carriages });
    } catch (error) {
        next(error);
    }
};

export const createCarriage = async (req, res, next) => {
    try {
        // Extract data from request body
        const { maDoanTau, loaiToa, slViTri } = req.body;
        if(!maDoanTau)
            return res.status(400).json({ success: false, message: 'Missing required field: maDoanTau' });
        if(!loaiToa)
            return res.status(400).json({ success: false, message: 'Missing required field: loaiToa' });
        if(!slViTri)
            return res.status(400).json({ success: false, message: 'Missing required field: slViTri' });

        await createCarriageService({ maDoanTau, loaiToa, slViTri });
        return res.status(201).json({ success: true, message: 'Create carriage successfully'});
    } catch (error) {
        next(error);
    }
};

export const updateCarriage = async (req, res, next) => {
    try {
        const carriageId = req.params.id;
        const updateData = req.body;
        await updateCarriageService(carriageId, updateData);
        return res.status(200).json({ success: true, message: 'Update carriage successfully'});
    } catch (error) {
        next(error);
    }
};