const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        // Kiểm tra: Nếu là lỗi từ Zod (có thuộc tính errors)
        if (error.errors && Array.isArray(error.errors)) {
            const errorMessages = error.errors.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }));

            return res.status(400).json({
                success: false,
                errors: errorMessages
            });
        }

        // Nếu là lỗi khác (lỗi logic, lỗi DB, hoặc lỗi hệ thống)
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export default validate;