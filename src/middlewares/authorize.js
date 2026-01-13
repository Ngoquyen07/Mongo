export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const { role } = req.user;
        if (!allowedRoles.includes(role.name)) {
            return res.status(403).json({
                success: false,
                message: `You are not authorized to access this page!`
            });
        }
        next();
    };
};