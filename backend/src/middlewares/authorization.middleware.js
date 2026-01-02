export const authorizeManager = (req, res, next) => {
    // Assuming req.user is populated by authenticationMiddleware
    const role = req.user.role?.toLowerCase();

    if (role !== 'quản trị' && role !== 'quản lý') {
        return res.status(403).json({ 
            success: false, 
            message: 'Bạn không có quyền truy cập tài nguyên này' 
        });
    }
    next();
};