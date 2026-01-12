import {User} from "../models/User.model.js";

const ROLES = ["admin","manager","employee"]

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        // Check if username exists
        const userByUsername = await User.findOne({ username: req.body.username });
        if (userByUsername) {
            return res
                .status(400)
                .json({ message: "Failed! Username is already in use!" });
        }

        // Check if email exists
        const userByEmail = await User.findOne({ email: req.body.email });
        if (userByEmail) {
            return res.status(400).json({ message: "Failed! Email is already in use!" });
        }

        // Check password validation

        const password = req.body.password;
        if(!password){
            return res.status(400).json({ message: "Password field is required!" });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const checkRoleExisted = (req, res, next) => {
    let { role } = req.body;
    role = role.toLowerCase();
    if (!ROLES.includes(role)) {
        return res.status(400).json({
            message: `Failed! Role "${role}" does not exist!`,
        });
    }
    next();
};