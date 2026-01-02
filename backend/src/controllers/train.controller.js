import { createTrainService, createCarriageService } from '../services/train.service.js';

// Controller for creating a Train
export const createTrain = async (req, res) => {
    try {
        // Extract data from request body
        const { maDoanTau, tenTau, hangSanXuat, ngayVanHanh, loaiTau } = req.body;

        // Basic validation
        if (!maDoanTau || !tenTau || !loaiTau) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields (maDoanTau, tenTau, loaiTau)'
            });
        }

        const result = await createTrainService({ maDoanTau, tenTau, hangSanXuat, ngayVanHanh, loaiTau });

        return res.status(201).json({
            success: true,
            message: 'Create train successfully',
            data: result
        });
    } catch (error) {
        // Handle SQL specific errors (defined in your SP RAISERROR)
        if (error.originalError && error.originalError.info) {
             return res.status(400).json({
                success: false,
                message: error.originalError.info.message 
            });
        }
        
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Controller for creating a Carriage
export const createCarriage = async (req, res) => {
    try {
        // Extract data from request body
        const { maToaTau, maDoanTau, stt, loaiToa, slViTri } = req.body;

        if (!maToaTau || !maDoanTau || !loaiToa) {
             return res.status(400).json({
                success: false,
                message: 'Missing required fields (maToaTau, maDoanTau, loaiToa)'
            });
        }

        const result = await createCarriageService({ maToaTau, maDoanTau, stt, loaiToa, slViTri });

        return res.status(201).json({
            success: true,
            message: 'Create carriage successfully',
            data: result
        });
    } catch (error) {
         if (error.originalError && error.originalError.info) {
             return res.status(400).json({
                success: false,
                message: error.originalError.info.message 
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};