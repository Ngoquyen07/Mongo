import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import {authRouter} from './routers/auth.routers.js';
import {rootRouter} from "./routers/index.js";
import {verifyToken} from "./middlewares/authJwt.js";
export const app = express();
app.use(express.json())
app.use(cors({
    origin: 'http://127.0.0.1:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser())
app.use(authRouter)
app.use('/api',verifyToken,rootRouter)
