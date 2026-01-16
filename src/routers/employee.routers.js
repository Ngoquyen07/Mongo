import express from "express";
import {getEmployeeInfo} from "../controllers/employee.controller.js";

export const employeeRouter = express.Router();
employeeRouter.use(express.json());
employeeRouter.get('/me', getEmployeeInfo)