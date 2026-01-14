import {User} from "../models/User.model.js";
import {Role} from "../models/Role.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
export const register = async (req, res) => {
    try{
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
        });
        const roleName = req.body.role || "employee";
        const roleDoc = await Role.findOne({ name: roleName });
        user.role = roleDoc._id;
        await user.save();
        return res.status(201).json({
            success: true,
            message: `Register successfully`,

        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}
export const getAll = async(req,res)=>{
    try{
        const adminRole = await Role.findOne({ name: 'admin' });
        const staffs = await User.find({
            role: { $ne: adminRole._id }
        }).select('-__v').populate({
            path:'role',
            select: 'name'}).populate('employees').populate('manager')
        return res.status(200).json({
            success: true,
            data: staffs
        });
    }
    catch(err){
        return res.status(400).send({
            success: false,
            message: err.message,
        })
    }
}

export const getManagers = async(req,res)=>{
    try{
        const managerRoleName = await Role.findOne({ name: 'manager' });
        const managers = await User.find({
            role: managerRoleName._id
        }).populate('role').populate('employees')
        return res.status(200).json({
            success: true,
            data: managers
        })
    }
    catch(err){
        return res.status(400).send({
            success: false,
            message: err.message,
        })
    }
}
export const getOrphanEmployee = async (req, res) => {
    try{
        const employeeRole = await Role.findOne({ name: 'employee' });
        if(!employeeRole) return res.status(404).json({ success: false, message: "Role not found" });
        const orphanEmployees = await User.find({
            role:employeeRole._id,
            $or: [
                { manager: { $exists: false } },
                { manager: null }
            ]
        }).populate('role')
        return res.status(200).json({
            success: true,
            data: orphanEmployees,
        })
    }
    catch (error) {
        return res.status(400).send({
            success: false,
            message: error.message,
        })
    }
}
export const updateUserRole = async (req, res) => {
    //Create and start session
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { userId, roleName } = req.body;
        const user = await User.findById(userId).populate('role');
        const targetRole = await Role.findOne({ name: roleName });

        if (!user){
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (!targetRole){
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ success: false, message: "No such role" });
        }
        const currentRole = user.role.name;
        if (currentRole === roleName) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ success: false, message: "User already has this role" });
        }
        let notification = "";
        let isPromoted = false;
        // Case1 : Hạ cấp
        if (currentRole === 'manager' && roleName !== 'manager') {
            // Clear quản lý của những employees có quản lý bị hạ cấp
            const subordinates = await User.updateMany(
                { manager: user._id },
                { $unset: { manager: "" } },
                {session}
            );
            notification = `Demote successfully`;
        }
        // Case2 : Thăng cấp
        else if (currentRole === 'employee' && (roleName === 'manager')) {
            isPromoted = true;
            notification = `Promote successfully`;
        }
        else {
            notification = `User role updated from ${currentRole} to ${roleName}.`;
        }
        user.role = targetRole._id;
        await user.save({session});
        //commit and end session
        await session.commitTransaction();
        await session.endSession();

        return res.status(200).json({
            success: true,
            message: notification,
            isPromoted : isPromoted ,
            data: {
                username: user.username,
                from: currentRole,
                to: roleName
            }
        });
    } catch (err) {
        //rollback
        await session.abortTransaction();
        await session.endSession();
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



export const assignEmployeesToManager = async (req, res) => {
    // Input : list of employee's ids and a manager's id .
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        const { managerId, employeeIds } = req.body; // employeeIds nên là một mảng [id1, id2, ...]

        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({
                success: false,
                message: "No employee id found"
            })
        }
        const manager = await User.findById(managerId).session(session);
        if (!manager) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).send({
                success: false,
                message: "Manager does not exist"
            })
        }
        const updateResult = await User.updateMany(
            { _id: { $in: employeeIds } },
            { $set: { manager: managerId } },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: `Successfully assigned ${updateResult.modifiedCount} employees to manager ${manager.username}`,
            data: {
                managerId,
                affectedCount: updateResult.modifiedCount
            }
        });
    }
    catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).send({
            success: false,
            message: error.message,
        })
    }
}

export const deleteStaff = async (req, res) => {
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        const {userId} = req.body;
        const user = await User.findById(userId).populate('role').session(session);
        if(!user){
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const roleName = user.role.name;
        console.log(roleName);
        if(roleName === "manager") {
            const subordinates = await User.updateMany(
                { manager: user._id },
                { $unset: { manager: "" } },
                {session}
            );
        }
        await User.findByIdAndDelete(userId).session(session);
        await session.commitTransaction();
        await session.endSession();
        return res.status(200).json({
            success: true,
            message: "Delete user successfully"
        })
    }
    catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).send({
            success: false,
            message: error.message,
        })
    }
}
