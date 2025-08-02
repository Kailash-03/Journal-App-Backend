import express from "express";        
import { Router } from "express";       
import { createNewUser, getUserDetails, isAuthorized, loginUser, logoutUser } from "../controllers/users.js";

const router = express.Router();    

router.post("/loginUser",loginUser);
router.post("/createUser",createNewUser);
router.get("/getUserDetails",isAuthorized,getUserDetails);
router.get("/logout",isAuthorized,logoutUser);

export default router;