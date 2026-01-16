import {User} from "../models/User.model.js";

export const getEmployeeInfo = async(req, res) => {
    try{
        const employeeId = req.user._id;
        const employeeInfo = await User.findById(employeeId)
            .select('-__v')
            .populate({
                path: 'role',
                select: '-__v'
            })
            .populate({
                path: 'manager',
                select: '_id username email'
            });
        if (!employeeInfo) {
            return res.status(404).send({
                success: false,
                error: 'No such employee found'
            });
        }
        return res.status(200).send({
            success: true,
            data: employeeInfo
        })
    }
    catch(error){
        res.status(400).send({
            success: false,
            message: error,
        })
    }
}