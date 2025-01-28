import User from "../models/users.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getUsersForSidebar = async (req,res) =>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-passwod");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUSerSidebar :", error.message);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
};

export const getMessages = async (req,res) =>{
    try {
        const {id:usertoChatId} = req.params;
        const myId= req.user._id;
        
        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:usertoChatId},
                {senderId:usertoChatId,receiverId:myId},
            ]
        })
        res.status(200).json(messages);
        
    } catch (error) {
        console.log("Error in get Messages controller :", error.message);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
};
export const sendMessage = async (req,res) =>{
    try {
        const {text , image} = req.body;
        const { id: receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
        
        res.status(200).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controllers :", error.message);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
};
