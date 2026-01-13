import express from 'express';
import cors from 'cors';
import {authRouter} from './routers/auth.routers.js';
import {rootRouter} from "./routers/index.js";
export const app = express();
app.use(express.json())
app.use(cors())
app.use(authRouter)
app.use(rootRouter)
