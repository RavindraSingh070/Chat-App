import mongoose from "mongoose"

export const connectDB = async (req,res) =>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(console.log("DB is Connected Successfully"))
    .catch( (error) =>{
        console.log(error);
        console.log("DB connection Issue");
        process.exit(1);
    })
}