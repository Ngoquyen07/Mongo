import express from 'express';
import {adminRouter} from "./admin.routers.js";
export const rootRouter = express.Router();
rootRouter.use('/admin', adminRouter);