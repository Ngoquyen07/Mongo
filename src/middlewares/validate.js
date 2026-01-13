const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        const parsedErrors = JSON.parse(error.message);
        const errorMessages = parsedErrors.map(err => err.message);
        return res.status(400).json({
            success: false,
            errors: errorMessages
        });
    }
}
export default validate;