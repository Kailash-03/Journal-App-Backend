import { raw } from "express";
import { journal } from "../models/journal.js";
import { normalizeToStartOfDay } from "./utils.js";
import Sentiment from "sentiment";

export const createNewEntry = async (req, res) => {
  try {
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
    if (normalizedScore >= 8) {
      mood = "happy";
    } else if (normalizedScore >= 3) {
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
  } catch (error) {
    console.error("Error in createNewEntry:", error);
    console.trace();
    return res.status(500).json({
      status: false,
      message: "Internal server error while creating journal entry"
    });
  }
};

export const getEntriesByDateRange = async (req, res) => {
  try {
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
      id: entry._id,
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
  } catch (error) {
    console.error("Error in getEntriesByDateRange:", error);
    console.trace();
    return res.status(500).json({
      status: false,
      message: "Internal server error while fetching entries by date range"
    });
  }
};

export const getMySpecificEntry = async (req, res) => {
  try {
    const { id } = req.params; // Get entry id from route params
    const jentry = await journal.findOne({ _id: id, user: req.user._id });

    if (!jentry) {
      return res.status(404).json({
        status: "false",
        message: "No Journal entry exists for this id"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Entry Fetched Successfully",
      entry: jentry
    });
  } catch (error) {
    console.error("Error in getMySpecificEntry:", error);
    console.trace();
    return res.status(500).json({
      status: false,
      message: "Internal server error while fetching specific entry"
    });
  }
};

export const getAllMyEntries = async (req, res) => {
  try {
    const entries = await journal.find({ user: req.user._id }).sort({ date: 1 });

    if (!entries) {
      return res.status(400).json({
        status: "false",
        message: "No Journal entry exists for this user"
      });
    }

    const graphData = entries.map(entry => ({
      _id: entry._id,
      brief: entry.brief,
      description: entry.description,
      date: entry.date.toISOString().split('T')[0],
      score: entry.score,
      sentimentScore: entry.sentimentScore,
      mood: entry.mood
    }));

    return res.status(200).json(
      {
        status: true,
        message: "Entry Fetched Successfully",
        data: graphData
      }
    );
  } catch (error) {
    console.error("Error in getAllMyEntries:", error);
    console.trace();
    return res.status(500).json({
      status: false,
      message: "Internal server error while fetching all entries"
    });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { brief, description, date, score } = req.body;

    // Build a dynamic update object
    const updateFields = {};

    if (brief !== undefined) updateFields.brief = brief;
    if (description !== undefined) updateFields.description = description;
    if (score !== undefined) updateFields.score = score;
    if (date !== undefined) updateFields.date = normalizeToStartOfDay(date);

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
    console.error("Error in updateEntry:", err);
    console.trace();
    return res.status(500).json({
      status: false,
      message: "Something went wrong while updating the journal entry"
    });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const tryDelete = await journal.findOneAndDelete({
      _id: id, user: req.user._id
    });

    if (!tryDelete) {
      return res.status(404).json({
        status: false,
        message: "Journal entry not found or unauthorized"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Journal entry deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteEntry:", error);
    console.trace();
    return res.status(500).json({
      status: false,
      message: "Something went wrong while deleting the journal entry"
    });
  }
};