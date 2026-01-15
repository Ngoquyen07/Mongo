import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {User} from "../models/User.model.js";
import {Role} from "../models/Role.model.js";
import config from "../config/auth.js";

export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email: email}).populate(
            "role"
        ).select('+password')
        if (!user) {
            return res.status(400).json({
                success: false,
                errors: {
                    email: ['Email does not exist!']
                }
            })
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                errors: {
                    password: ['Passwords do not match!']
                }
            })
        }
        const token = jwt.sign({id : user.id}, config.secretKey, {
            expiresIn: config.expiresIn,
            algorithm: "HS256",
        })
        const refreshToken = jwt.sign({ id: user.id }, config.refreshKey, {
            algorithm: "HS256",
            expiresIn: '1d',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false
        });
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
    catch (err) {
        return res.status(500).json({
            success: false,
            errors: {
                _form: [err.message],
            }
        })
    }
}
export const refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' })
    }

    try {
        const payload = jwt.verify(refreshToken, config.refreshKey)
        const newAccessToken = jwt.sign(
            { id: payload.id},
            config.secretKey,
            { expiresIn: config.expiresIn }
        )
        res.json({ accessToken: newAccessToken })
    } catch {
        return res.status(403).json({
            message: 'Refresh token expired'
        })
    }
}

export const logout = async (req, res) => {
    try{
        res.clearCookie('refreshToken');
        return res.status(200).json({
            message: `Logout successfully`,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            errors: err.message,
        })
    }
}