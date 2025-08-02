import express from "express";
import mongoose from "mongoose";    
import { Router } from "express";
import { createNewEntry,getMySpecificEntry,getAllMyEntries, updateEntry, deleteEntry } from "../controllers/journal.js"; 
import { isAuthorized } from "../controllers/users.js";  

const router = express.Router();    

//journal
router.post("/createEntry",isAuthorized,createNewEntry);
router.post("/getMySpecificEntry",isAuthorized,getMySpecificEntry);
router.get("/getAllMyEntries",isAuthorized,getAllMyEntries);

router.route("/:id")
.put(isAuthorized,updateEntry)
.delete(isAuthorized,deleteEntry);

export default router;  
