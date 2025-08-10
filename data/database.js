import e from 'express'
import mongoose from 'mongoose'

export const connectDB = async() => {
    mongoose.connect(process.env.mongo_url,{
        dbName:"Journal",
    }).then(
        console.log("DB connected successfully")
    ).catch((e)=>{
        return e;
    })
}

