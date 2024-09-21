// configuring dotenv to access variables
require('dotenv').config()
/**************************/
const express = require("express");
const app = express();
const consoleLog = require("./Utils/consoleLog.js");
const appUses = require("./Startup/appUses.js")
// environment vars
const PORT = process.env.PORT;


  appUses(express ,app);


// Server Launch
app.listen(PORT,()=>{
    consoleLog(`Server is Running on port : ${PORT}` , "success"); 
})


