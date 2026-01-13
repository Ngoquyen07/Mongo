import {User} from "../models/User.model.js";

const ROLES = ["admin","manager","employee"]

export const checkSignupRequirements = async (req, res, next) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        if(!password){
            return res.status(400).json({ success: false, message: "Password field is required!" });
        }
        if(password !== confirmPassword){
            return res.status(400).json({ success: false, message: "Password do not match!" });
        }
        const existingUser = await User.findOne({
            $or: [{ username: username }, { email: email }]
        });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ success: false, message: "Failed! Username is already in use!" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ success: false, message: "Failed! Email is already in use!" });
            }
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const checkRoleExisted = (req, res, next) => {
    let { role } = req.body;
    if(!role){
        return res.status(400).json({success: false, message: "Role is required!" });
    }
    role = role.toLowerCase();
    if (!ROLES.includes(role)) {
        return res.status(400).json({
            success: false,
            message: `Failed! Role '${role}' does not exist!`,
        });
    }
    next();
};