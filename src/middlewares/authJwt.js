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