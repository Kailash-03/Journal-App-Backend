import { journal } from "../models/journal.js";
import {normalizeToStartOfDay} from "./utils.js";

// yet to add jwt hashing and all for userid 
export const createNewEntry = async (req,res)=>{
  const {brief,description,date,score} = req.body;  
  const normalisedDate = normalizeToStartOfDay(date);
  const prevEntry = await journal.findOne({user: req.user._id,date:normalisedDate});

  if(prevEntry)
  {
    return res.status(400).json({
            status:"false",
            message:"Journal entry already exists for this date"
    })
  }
  const entry = await  journal.create({
    brief,description,date:normalisedDate,score,user:req.user._id
  });

  return res.status(201).json({
    status:"true",
    message:"journal entry created successfully"
  })
}

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
  const entries = await journal.find({user:req.user._id});

  if(!entries)
  {
    return res.status(400).json({
            status:"false",
            message:"No Journal entry exists for this user"
    })
  }

  return res.status(200).json(
    {
      status:true,
      message:"Entry Fetched Successfully",
      entries: entries
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