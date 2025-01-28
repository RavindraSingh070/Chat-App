import jwt from "jsonwebtoken"
import User from "../models/users.model.js"
import cookieParser from "cookie-parser";

export const protectRoute = async (req,res,next) =>{
    try {
        const token = req.cookies.jwt;
        // console.log(req.cookies.jwt)
        if(!token)
        {
            return res.status(401).json({
                success:false,
                message:"Inautherized - No Token Provided",
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({
                success:false,
                message:"Inautherized - Invalid Token ",
            })
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not Found",
            })
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("Error in protected middleware",error.message);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        })
    }
}