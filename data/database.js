import e from 'express'
import mongoose from 'mongoose'

export const connectDB = async() => {
    mongoose.connect("mongodb://localhost:27017",{
        dbName:"Journal",
    }).then(
        console.log("DB connected successfully")
    ).catch((e)=>{
        return e;
    })
}

