import {
  getUserByEmailService,
  updateUserService,
  deleteUserService,
  getAllUsersService,
} from '../services/user.service.js';

export const getCurrentUser = async (req, res) => {
  try {
    const emailUser = req.user.email;
    const user = await getUserByEmailService(emailUser);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const emailUser = req.user.email;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data provided to update',
      });
    }

    const updatedUser = await updateUserService(emailUser, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (updatedUser.updated === false) {
      return res.status(400).json({
        success: false,
        message: updatedUser.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const emailUser = req.user.email;
    const result = await deleteUserService(emailUser);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already deleted',
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();

    if (!users) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};