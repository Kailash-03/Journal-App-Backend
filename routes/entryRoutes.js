import express from "express";
import mongoose from "mongoose";    
import { Router } from "express";
import { createNewEntry,getMySpecificEntry,getAllMyEntries, updateEntry, deleteEntry, getEntriesByDateRange } from "../controllers/journal.js"; 
import { isAuthorized } from "../controllers/users.js";  

const router = express.Router();    

//journal
router.post("/createEntry",isAuthorized,createNewEntry);
router.get("/getAllMyEntries",isAuthorized,getAllMyEntries);
router.get("/getEntriesByDateRange",isAuthorized,getEntriesByDateRange); // Assuming this is the correct endpoint for graph data

router.route("/:id")
.get(isAuthorized,getMySpecificEntry)
.put(isAuthorized,updateEntry)
.delete(isAuthorized,deleteEntry);

export default router;  

