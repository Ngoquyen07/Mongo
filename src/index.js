import 'dotenv/config';
import {app} from "./app.js";
const PORT = process.env.PORT || 8000;
import {connectDB} from "./config/database.js";
import {Role} from "./models/Role.model.js";

const startServer = async () => {
    try{
        await connectDB();
        await initial()
        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    }
    catch(e){
        console.error("Something went wrong", e);
    }
}
const initial = async () => {
    const count = await Role.estimatedDocumentCount();
    try{
        if(count === 0){
            await Role.insertMany([
                {name : "admin"},
                {name : "manager"},
                {name : "employee"},
            ])
            console.log(" Added 'admin', 'manager', and 'employee' to roles collection.")
        }
        else{
            console.log("Roles already exist!");
        }
    }
    catch(e){
        console.error("Something went wrong", e);
    }
}
startServer();