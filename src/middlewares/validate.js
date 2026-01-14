const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
        const errors = {}

        result.error.issues.forEach((err) => {
            const field = err.path[0] || '_form'
            errors[field] ??= []
            errors[field].push(err.message)
        })

        return res.status(400).json({
            success: false,
            errors
        })
    }

    next()
}

export default validate
