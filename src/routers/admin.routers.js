import express from "express";
import {register } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {validateRegister} from "../validations/validateRegister.js";
import {verifyToken } from "../middlewares/authJwt.js";
import {checkSignupRequirements , checkRoleExisted } from "../middlewares/verifyRegister.js";
import {authorize} from "../middlewares/authorize.js";
export const adminRouter = express.Router();
adminRouter.post("/register",
    verifyToken,
    authorize(['admin']),
    validate(validateRegister),
    checkSignupRequirements,
    checkRoleExisted,
    register
);
