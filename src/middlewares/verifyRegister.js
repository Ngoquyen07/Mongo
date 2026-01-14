import {User} from "../models/User.model.js";

const ROLES = ["manager","employee"]

export const checkSignupRequirements = async (req, res, next) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({
            $or: [{ email: email }]
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    errors: {
                        email: ['Failed! Email is already in use!']
                    }
                });
            }
        }
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            errors: {
                _form: [err.message],
            }
        });
    }
};

export const checkRoleExisted = (req, res, next) => {
    let { role } = req.body;
    if(!role){
        return res.status(400).json({
            success: false,
            errors: {
                role: ["Role is required!"],
            }
        });
    }
    role = role.toLowerCase();
    if (!ROLES.includes(role)) {
        return res.status(400).json({
            success: false,
            errors: {
                role: [`Failed! Role '${role}' does not exist!`],
            }
        });
    }
    next();
};