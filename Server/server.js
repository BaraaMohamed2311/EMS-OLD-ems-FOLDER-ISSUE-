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
const connectMongoDB = require("./Utils/connect_mongodb.js")

// Connect
connectMongoDB()

// environment vars
const PORT = process.env.PORT;

// to unjson requests
app.use(express.json());
app.use(cors());
// Routes
app.use("/api/dashboard",dashboardApis)
app.use("/api/user",authApis)
app.use("/api/profile",profileApis)


 
// Server Launch
app.listen(PORT,()=>{
    console.log(`Server is Running on port : ${PORT}`);
})