import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";


export const isAuthorized = async (req,res,next)=>{
    const { token } = req.cookies;

    if(!token)
    {
        return res.status(400).json({
            status:false,
            message:"login first"
        })
    }

    const userid = jwt.decode(token,process.env.process.env.secret_key);

    req.user = await User.findById(userid);
    next();
}

export const loginUser = async (req,res)=>{
    try {

        let { token } = req.cookies;
        if(token)
        {
            return res.status(400).json({
            status:false,
            message:"Bad request, already logged in",
            })
        }
        const {email,password} = req.body;
        const user = await User.findOne({email});

        if(!user) return res.status(400).json({
            status:"false",
            message:"incorrect email id"
        })

        const result = await bcrypt.compare(password,user.password);
        if(!result)
        {
            return res.status(400).json({
            status:"false",
            message:"incorrect password. Please try again"
        })
        }

        token = jwt.sign({ _id: user._id }, process.env.secret_key);
        return res.status(200).cookie("token",token,{
            httpOnly:true,
            maxAge:15*60*1000
        }).json({
            status:"true",
            message:"user logged in succesfully"
        });

    }
        catch(error)
        {
            console.log(error);
        return res.status(500).json({
            status:"false",
            message:"internal server error"
        })
    }
}

export const createNewUser = async (req,res)=>{
    try {
        let { token } = req.cookies;

        if(token)
        {
            return res.status(400).json({
                status: "false",
                message:"already logged in user"
            })
        }

        const {name, email, password} = req.body;
        let user = await User.findOne({email});

        if(user) return res.status(400).json({
            status:"false",
            message:"user already exists"
        });

        const hashedPassword  = await bcrypt.hash(password,10);

        user = await User.create({name,email,password:hashedPassword});
        token = jwt.sign({ _id: user._id }, process.env.secret_key);
        console.log("user created successfully");

        return res
        .status(200)
        .cookie("token",token,{
            httpOnly:true,
        })
        .json({
            status:"true",
            message:"user created successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status:"false",
            message:"internal server error"}
        );
       
    }
}

export const getUserDetails = (req,res)=>{
    return res.status(200).json({
        status:true,
        message:`${ req.user.name }user details fetched successfully`,
        user:req.user
    })
};

export const logoutUser = (req,res)=>{
    try {
        return res.status(200).cookie("token","",{
            expires:new Date(Date.now()),
            httpOnly:true
        }).json({
            status:true,
            message:"logged out successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status:"false",
            message:"internal server error"}
        )
    }
}