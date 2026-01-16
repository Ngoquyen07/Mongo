import {User} from "../models/User.model.js";

export const getManagerInfo = async (req, res) => {
    try{
        const managerId = req.user._id ;
        const managerInfo = await User.findById(managerId)
            .select('-__v')
            .populate({
                path: 'role',
                select: '-__v'
            })
            .populate({
                path: 'employees',
                select: '_id username email -manager'
            });
        if (!managerInfo) {
            return res.status(404).send({
                success: false,
                error: 'No such manager found'
            });
        }
        return res.status(200).send({
            success: true,
            data: managerInfo
        })
    }
    catch(err){
        return res.status(400).send({
            success: false,
            error: err
        });
    }


}