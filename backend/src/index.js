import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { app,server } from "./lib/socket.js"
import { connectDB } from "./lib/db.js";
import path, { dirname } from "path";


dotenv.config();
const __dirname = path.resolve();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(
   {
    origin:"http://localhost:5173",
    credentials:true
   }
))
app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes);
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

const PORT = process.env.PORT|| 4000;


server.listen(PORT, () => {
    console.log("server is running on Port: " + PORT);
    connectDB();
})