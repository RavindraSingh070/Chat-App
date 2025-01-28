import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs"
export const signup = async (req,res) =>{
    
    try {
        const {fullName,email,password}=req.body;
        if(!fullName||!email||!password){
            return res.status(400).json({
                success:false,
                message:"Please fill the details"
            })
        }
        if(password.length < 6){
            return res.status(400).json({
                success:false,
                message:"Password must be at least 6 characters"
            });
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hassedpassword = await bcrypt.hash(password,salt);
        const newUser = new User ({
            fullName,
            email,
            password:hassedpassword
        })
        if(newUser){

            //generate jwt token
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                success:true,
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic
            })

        }else{
             return res.status(400).json({
                success:false,
                message:"Invalid User Data"
            });
        }

        
    } catch (error) {

        console.log("Error in signup controller", error.message);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
        
    }
};
export const login = async (req,res) =>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({
                success:false,
                message:"Invalid Password"
            })
        }
        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })

        
    } catch (error) {
        console.log("Error in login controller",error.message);
        return res.status(500).json({
            success:false,
            message:" Internal server error"
        })
    }
};
export const logout = async (req,res) =>{
    try {
        res.cookie("jwt","",{
            maxAge:0
        })
        res.status(200).json({
            success:true,
            message:"Logged out successfully"
        })
    } catch (error) {
        console.log("Error in logout controller",error.message);
        return res.status(500).json({
            success:false,
            message:" Internal server error"
        })
        
    }
};
export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
    //   console.log(profilePic)
    //   console.log(req.body);
      const userId = req.user._id;
      
      if (!profilePic && typeof profilePic !== "string") {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
export const checkAuth = async(req,res) =>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checking controller", error.message);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}