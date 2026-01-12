import express from 'express';
import cors from 'cors';
import authRouter from './routers/auth.routers.js';
export const app = express();
app.use(express.json())
app.use(cors())
app.use(authRouter)
app.get('/api/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Kết nối thành công! Server đang hoạt động tốt.",
        timestamp: new Date().toLocaleString(),
        environment: "Development"
    });
});