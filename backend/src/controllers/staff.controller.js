import {
    getStaffByEmailService,
    updateStaffService,
    deleteStaffService,
    getAllStaffService,
} from '../services/staff.service.js';

export const getCurrentStaff = async (req, res) => {
    try {
        const emailStaff = req.user.email;
        const staff = await getStaffByEmailService(emailStaff);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: staff,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const emailStaff = req.user.email;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No data provided to update',
            });
        }

        const updatedStaff = await updateStaffService(emailStaff, updateData);

        if (!updatedStaff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found',
            });
        }

        if (updatedStaff.updated === false) {
            return res.status(400).json({
                success: false,
                message: updatedStaff.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Staff updated successfully',
            data: updatedStaff,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const emailStaff = req.user.email;
        const result = await deleteStaffService(emailStaff);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found or already deleted',
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getAllStaff = async (req, res) => {
  try {
    const staff = await getAllStaffService();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

