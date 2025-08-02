import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './data/database.js';
import {app} from './app.js';

    connectDB();


    app.listen(3000, () => { 
    console.log("Server is running on port 3000");
    });