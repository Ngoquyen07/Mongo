import express from "express";
import {getManagerInfo} from "../controllers/manager.controller.js";

export const managerRouter = express.Router();
managerRouter.use(express.json());
managerRouter.get('/me', getManagerInfo)