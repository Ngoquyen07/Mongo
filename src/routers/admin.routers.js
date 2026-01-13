import express from "express";
import {register } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {validateRegister} from "../validations/validateRegister.js";
import {verifyToken } from "../middlewares/authJwt.js";
import {checkSignupRequirements , checkRoleExisted } from "../middlewares/verifyRegister.js";
import {authorize} from "../middlewares/authorize.js";
import {
    assignEmployeesToManager, deleteStaff,
    getAll,
    getOrphanEmployee,
    updateUserRole
} from "../controllers/admin.controller.js";
export const adminRouter = express.Router();
adminRouter.use(express.json());
adminRouter.post("/register",
    verifyToken,
    authorize(['admin']),
    validate(validateRegister),
    checkSignupRequirements,
    checkRoleExisted,
    register
);
adminRouter.get("/staffs",
    verifyToken,
    authorize(['admin']),
    getAll
)
adminRouter.put("/staffs/update_role",
    verifyToken,
    authorize(['admin']),
    updateUserRole)
adminRouter.get("/staffs/orphan_employees",
    verifyToken,
    authorize(['admin']),
    getOrphanEmployee)
adminRouter.put("/staffs/assign_employees_to_manager",
    verifyToken,
    authorize(['admin']),
    assignEmployeesToManager)
adminRouter.delete("/staffs/delete_user",
    verifyToken,
    authorize(['admin']),
    deleteStaff)
