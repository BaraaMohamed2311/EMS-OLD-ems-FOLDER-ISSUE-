// configuring dotenv to access variables
require('dotenv').config()
/**************************/
const express = require("express");
const app = express();
const cors = require("cors");
const consoleLog = require("./Utils/consoleLog.js")
// routers
const listApis = require("./Routers/list.js");
const authApis = require("./Routers/auth.js");
const profileApis = require("./Routers/profile.js");
const MailApis = require("./Routers/mail.js");
const dashboardApis = require("./Routers/dashboard.js")
// Utils

// connect to mongodb 
const EMS_URL = process.env.EMS_MongoDB;
// environment vars
const PORT = process.env.PORT;

  
// to unjson requests
app.use(express.json());
app.use(cors());
// Middleware to enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.header("Access-Control-Expose-Headers", "Content-Type"); // Expose Content-Type header
    next();
  });
// Routes
app.use("/api/list",listApis)
app.use("/api/user",authApis)
app.use("/api/profile",profileApis)
app.use("/api/mail",MailApis)
app.use("/api/dashboard",dashboardApis)


 
// Server Launch
app.listen(PORT,()=>{
    consoleLog(`Server is Running on port : ${PORT}` , "success"); 
})


