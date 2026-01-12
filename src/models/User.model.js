import mongoose, {Schema} from 'mongoose';
const {schema} = mongoose;
const UserSchema = new Schema({
        username : String,
        email : String,
        password: String,
        role : {
            type: Schema.Types.ObjectId,
            ref: 'Role'
        },
        manager:{
            type : Schema.Types.ObjectId,
            ref : 'User'
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    });
UserSchema.virtual('Employees',{
    ref : 'User',
    localField: '_id',
    foreignField: 'manager',
})
export const User = mongoose.model('User',UserSchema);