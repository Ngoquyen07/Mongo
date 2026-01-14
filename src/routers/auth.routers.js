import express from "express";
import {login, logout, refreshToken} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {validateLogin} from "../validations/validateLogin.js";

export const authRouter = express.Router();
authRouter.post("/login" ,validate(validateLogin),login);
authRouter.post("/refreshToken" ,refreshToken);
authRouter.post("/logout" ,logout);
