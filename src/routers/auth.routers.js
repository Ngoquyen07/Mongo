import express from "express";
import {register , login } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {validateRegister} from "../validations/validateRegister.js";
import {verifyToken , isAdmin , isManager } from "../middlewares/authJwt.js";
import {checkSignupRequirements , checkRoleExisted } from "../middlewares/verifyRegister.js";
import {validateLogin} from "../validations/validateLogin.js";

const router = express.Router();

router.post("/register",
    verifyToken,
    isAdmin,
    validate(validateRegister),
    checkSignupRequirements,
    checkRoleExisted,
    register
);
router.post("/login" ,validate(validateLogin),login);

export default router;