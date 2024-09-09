// configuring dotenv to access variables
require('dotenv').config()
/**************************/
const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
// routers
const dashboardApis = require("./Routers/dashboard.js");
const authApis = require("./Routers/auth.js");
const profileApis = require("./Routers/profile.js");
// Utils
const connect_mongodb = require("./Utils/connect_mongodb.js");
const connect_mongo_bucket = require("./Utils/connect_mongo_bucket.js");
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
app.use("/api/dashboard",dashboardApis)
app.use("/api/user",authApis)
app.use("/api/profile",profileApis)


 
// Server Launch
app.listen(PORT,()=>{
    console.log(`Server is Running on port : ${PORT}`);
})