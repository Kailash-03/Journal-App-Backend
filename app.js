import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userroutes.js";
import entryRouter from "./routes/entryRoutes.js";
import cors from "cors";

export const app = express(); 

config({
    path : "./data/config.env",
})
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));    
app.use("/api/v1/user", userRouter);
app.use("/api/v1/entry", entryRouter);

// Logging middleware
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });


app.get("/",(req,res)=>{
    console.log("chal rha h bhai");
    return res.status(200).json({
        status:true,
        message:"ha bhai chlra h sab",
    })
})

