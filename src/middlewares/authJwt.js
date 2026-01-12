import jwt from 'jsonwebtoken';
import config from '../config/auth.js';
import {User} from "../models/User.model.js";
export const verifyToken = async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({
            error: 'No token provided',
        })
    }
    if(token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '');
    }
    try{
        const decoded = jwt.verify(token,config.secretKey);
        req.userId = decoded.id;
        const user = await User.findById(req.userId).populate('role');
        if(!user){
            return res.status(401).send({
                error: 'Invalid token',
            })
        }
        req.user = user;
        return next();
    }
    catch(err){
        return res.status(401).send({
            message: "Unauthorized!"
        })
    }
}
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.name === 'admin') {
        return next();
    }
    return res.status(403).send({ message: "Require Admin Role!" });
};

export const isManager = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.name === 'manager') {
        return next();
    }
    return res.status(403).send({ message: "Require Manager Role!" });
};