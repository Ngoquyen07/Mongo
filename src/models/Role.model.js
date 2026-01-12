import mongoose, {Schema} from 'mongoose';
const {schema} = mongoose;
const RoleSchema = new Schema({
    name: String,
})
export const Role = mongoose.model('Role', RoleSchema);