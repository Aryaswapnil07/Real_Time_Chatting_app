import mongoose from "mongoose"; // mongoose is a library that sits between nodejs and mongoDB
import { DB_NAME } from "../constants.js";


const connectDB = async () => { // async is used because talikin to databse takes time 
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1) // this means abnormal exist
    }
}

export default connectDB