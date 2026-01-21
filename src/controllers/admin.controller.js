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
        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }
}
export const getOverViewInfo = async (req, res) => {
    try {
        const adminRole = await Role.findOne({ name: 'admin' });
        const staffs = await User.find({
            role: { $ne: adminRole._id }
        }).select('-__v').populate({
            path:'role',
            select: 'name'}).populate('employees').populate('manager')
        const totalStaff = staffs.length

        const totalManagers = staffs.filter(
            u => u.role?.name === 'manager'
        ).length

        const totalEmployees = staffs.filter(
            u => u.role?.name === 'employee'
        ).length

        const totalOrphans = staffs.filter(
            u =>
                u.role?.name === 'employee' &&
                !u.manager
        ).length

        return res.status(200).json({
            success: true,
            data: {
                totalStaff,
                totalManagers,
                totalEmployees,
                totalOrphans
            }
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
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

export const getEmployees = async(req,res)=>{
    try{
        const managerRoleName = await Role.findOne({ name: 'employee' });
        const managers = await User.find({
            role: managerRoleName._id
        }).populate('role').populate('manager', 'username email');
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

export const getManagers = async (req, res) => {
    try {
        // 1. Lấy tham số từ query (mặc định page 1, limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const managerRoleName = await Role.findOne({ name: 'manager' });

        if (!managerRoleName) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        // 2. Thực hiện truy vấn đồng thời
        const [managers, totalManagers] = await Promise.all([
            User.find({ role: managerRoleName._id })
                .populate('role')
                .populate('employees')
                .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên đầu
                .skip(skip)
                .limit(limit),
            User.countDocuments({ role: managerRoleName._id })
        ]);

        const totalPages = Math.ceil(totalManagers / limit);

        return res.status(200).json({
            success: true,
            data: managers,
            pagination: {
                totalItems: totalManagers,
                totalPages: totalPages,
                currentPage: page,
                limit: limit
            }
        });
    } catch (err) {
        return res.status(400).send({
            success: false,
            message: err.message,
        });
    }
};
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
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { userId, roleName } = req.body;

        const user = await User
            .findById(userId)
            .select('role username')
            .populate({ path: 'role', select: 'name' })
            .session(session);

        if (!user) {
            throw new Error('User not found');
        }

        const targetRole = await Role
            .findOne({ name: roleName })
            .session(session);

        if (!targetRole) {
            throw new Error('Role not found');
        }

        const currentRole = user.role.name;

        if (currentRole === roleName) {
            throw new Error('User already has this role');
        }

        let notification = '';
        let isPromoted = false;

        /* ===== DEMOTE MANAGER ===== */
        if (currentRole === 'manager' && roleName !== 'manager') {
            await User.updateMany(
                { manager: user._id },
                { $unset: { manager: "" } },
                { session }
            );
            notification = 'Demoted successfully';
        }

        /* ===== PROMOTE EMPLOYEE ===== */
        if (currentRole === 'employee' && roleName === 'manager') {
            isPromoted = true;
            notification = 'Promoted successfully';
        }

        /* ===== UPDATE ROLE + REMOVE MANAGER FIELD ===== */
        await User.updateOne(
            { _id: user._id },
            {
                $set: { role: targetRole._id },
                $unset: { manager: "" }
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: notification || `Role updated from ${currentRole} to ${roleName}`,
            isPromoted,
            data: {
                username: user.username,
                from: currentRole,
                to: roleName
            }
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            success: false,
            message: err.message
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
