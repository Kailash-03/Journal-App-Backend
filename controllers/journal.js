import { raw } from "express";
import { journal } from "../models/journal.js";
import {normalizeToStartOfDay} from "./utils.js";
import Sentiment from "sentiment";

// yet to add jwt hashing and all for userid 
export const createNewEntry = async (req, res) => {
  const { brief, description, date, score } = req.body;

  // Validate and normalize date
  let normalizedDate;
  if (date) {
    normalizedDate = normalizeToStartOfDay(date);
    if (isNaN(new Date(normalizedDate))) {
      return res.status(400).json({
        status: "false",
        message: "Invalid date format"
      });
    }
  } else {
    normalizedDate = normalizeToStartOfDay(new Date());
  }

  const prevEntry = await journal.findOne({ user: req.user._id, date: normalizedDate });

  if (prevEntry) {
    return res.status(400).json({
      status: "false",
      message: "Journal entry already exists for this date"
    });
  }
  const textToAnalyze = brief + " " + description;
  const sentiment = new Sentiment();
  const sentimentScore = sentiment.analyze(textToAnalyze);
  let raw = sentimentScore.score;

  raw = Math.max(-10, Math.min(10, raw));
  const normalizedScore = ((raw + 10) / 20) * 10;

  let mood;
  if(normalisedScore >= 8) {
    mood = "happy";
  }else if(normalisedScore >= 3) {
    mood = "neutral";
  } else {
    mood = "sad";
  }

  const entry = await journal.create({
    brief,
    description,
    date: normalizedDate,
    score,
    sentimentScore: normalizedScore,
    mood,
    user: req.user._id
  });

  return res.status(201).json({
    status: "true",
    message: "journal entry created successfully"
  });
}

export const getEntriesByDateRange = async (req, res) => {
  let { startDate, endDate } = req.body;

  // Normalize and validate dates
  startDate = normalizeToStartOfDay(startDate);
  endDate = normalizeToStartOfDay(endDate);

  if (!startDate || !endDate) {
    return res.status(400).json({
      status: false,
      message: "Invalid or missing startDate/endDate"
    });
  }

  // Include the whole end day
  const endOfDay = new Date(endDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const entries = await journal.find({
    user: req.user._id,
    date: { $gte: startDate, $lte: endOfDay }
  }).sort({ date: 1 });

  if (!entries.length) {
    return res.status(400).json({
      status: "false",
      message: "No Journal entry exists for this user in the given range"
    });
  }

  const graphData = entries.map(entry => ({
    date: entry.date.toISOString().split('T')[0],
    score: entry.score,
    sentimentScore: entry.sentimentScore,
    mood: entry.mood
  }));

  return res.status(200).json({
    status: true,
    message: "Entries Fetched Successfully",
    data: graphData
  });
};


export const getMySpecificEntry = async (req,res)=>{

  let {date} = req.body;
  date = normalizeToStartOfDay(date);
  const jentry = await journal.findOne({date,user:req.user._id});

  if(!jentry)
  {
    return res.status(400).json({
            status:"false",
            message:"No Journal entry exists for this date"
    })
  }

  return res.status(200).json(
    {
      status:true,
      message:"Entry Fetched Successfully",
      entry: jentry
    }
  )

}


export const getAllMyEntries = async (req,res)=>{
  const entries = await journal.find({user:req.user._id}).sort({date:1});

  if(!entries)
  {
    return res.status(400).json({
            status:"false",
            message:"No Journal entry exists for this user"
    })
  }

  const graphData = entries.map(entry => ({
    brief: entry.brief,
    description: entry.description,
    date: entry.date.toISOString().split('T')[0],
    score: entry.score,
    sentimentScore: entry.sentimentScore,
    mood: entry.mood
  }));

  return res.status(200).json(
    {
      status:true,
      message:"Entry Fetched Successfully",
      data:graphData
    }
  )
}

export const updateEntry = async (req, res) => {
  const { id } = req.params;
  const { brief, description, date, score } = req.body;

  // Build a dynamic update object
  const updateFields = {};

  if (brief !== undefined) updateFields.brief = brief;
  if (description !== undefined) updateFields.description = description;
  if (score !== undefined) updateFields.score = score;
  if (date !== undefined) updateFields.date = normalizeToStartOfDay(date);

  try {
    const updated = await journal.findOneAndUpdate(
      { _id: id, user: req.user._id }, // ensures user owns the entry
      updateFields,
      { new: true } // return the updated document
    );

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Journal entry not found or unauthorized"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Journal entry updated successfully",
      entry: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong while updating the journal entry"
    });
  }
}


export const deleteEntry = async (req,res) => {
  try {
    const {id} = req.params;
  
  const tryDelete = await journal.findOneAndDelete({
    _id:id, user:req.user._id
  });


  if(!tryDelete)
  {
    return res.status(404).json({
      status:false,
      message:"Journal entry not found or unauthorized"
    })
  }

  return res.status(200).json({
    status:true,
    message:"Journal entry deleted successfully"
  });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong while deleting the journal entry"
    });
  }
}