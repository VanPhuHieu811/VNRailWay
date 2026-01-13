export const authorizeAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Quản trị' && req.user.role !== 'Nhân viên') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - Only admin and staff can access this resource'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}