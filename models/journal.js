import mongoose from "mongoose";
import { User } from "./user.js";
import { getStartOfTodayDate } from "../controllers/utils.js";

const schema  = mongoose.Schema({
    brief:{
        type:"String",
        required:true,
    },
    description:{
        type:"String",
        required:true,
    },
    date:{
        type:"Date",
        default: getStartOfTodayDate,
    },
    score:{
        type:"Number",
        default:0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

// compound index to enforce one entry per user per day
schema.index({ user: 1, date: 1 }, { unique: true });

export const journal = mongoose.model("Journal",schema);