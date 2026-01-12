import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {User} from "../models/User.model.js";
import {Role} from "../models/Role.model.js";
import config from "../config/auth.js";
export const register = async (req, res) => {
    try{
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
        });
        const roleName = req.body.role || "employee";

        const roleDoc = await Role.findOne({ name: roleName });

        if (!roleDoc) {
            return res.status(404).json({ message: `Role '${roleName}' not found` });
        }
        user.role = roleDoc._id;
        await user.save();
        return res.status(201).json({
            message: `Register successfully`,

        });
    }
    catch(err){
        return res.status(500).json({
            message: err.message,
        })
    }
}
export const login = async (req, res) => {
    try{
        const user = await User.findOne({email: req.body.email}).populate(
            "role"
        )
        if (!user) {
            return res.status(401).json({
                message: `Email ${req.body.email} not found`,
            })
        }
        const isMatch = await bcrypt.compareSync(req.body.password , user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: `Password not match`,
                accessToken: null,
            });
        }

        const token = jwt.sign({id : user.id}, config.secretKey, {
            expiresIn: config.expiresIn,
            algorithm: "HS256",
        })
        return res.status(200).json({
            message: `Login successfully`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role.name // Trả về tên role (admin/manager...)
            },
            accessToken: token,
        });
    }
    catch(err){
        return res.status(500).json({
            message: err.message,
        })
    }
}