import mongoose from 'mongoose';
export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to database');
    }
    catch(e){
        console.error("Error connecting database", e);
    }
}