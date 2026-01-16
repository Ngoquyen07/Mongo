import express from "express";
import validate from "../middlewares/validate.js";
import {validateRegister} from "../validations/validateRegister.js";
import {verifyToken } from "../middlewares/authJwt.js";
import {checkSignupRequirements , checkRoleExisted } from "../middlewares/verifyRegister.js";
import {authorize} from "../middlewares/authorize.js";
import {
    assignEmployeesToManager, deleteStaff,
    getAll, getOverViewInfo,
    getOrphanEmployee,
    updateUserRole,
    register, getManagers, getEmployees
} from "../controllers/admin.controller.js";
export const adminRouter = express.Router();
adminRouter.use(express.json());
adminRouter.post("/register",
    validate(validateRegister),
    checkSignupRequirements,
    checkRoleExisted,
    register
);
adminRouter.get("/staffs/getAll", getAll)
adminRouter.get("/staffs/overview", getOverViewInfo)
adminRouter.get("/staffs/managers", getManagers)
adminRouter.get("/staffs/employees", getEmployees)
adminRouter.get("/staffs/orphan_employees", getOrphanEmployee)
adminRouter.put("/staffs/update_role", updateUserRole)
adminRouter.put("/staffs/assign_employees_to_manager", assignEmployeesToManager)
adminRouter.delete("/staffs/delete_user", deleteStaff)
