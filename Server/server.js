const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
// routers
const dashboardApis = require("./Routers/dashboard.js");
const authApis = require("./Routers/auth.js");
// Utils
const connectionPool = require("./Utils/connect_ems_db.js");
// configuring dotenv to access variables
require('dotenv').config()
// environment vars
const PORT = process.env.PORT;

// to unjson requests
app.use(express.json());
app.use(cors());
// Routes
app.use("/api/dashboard",dashboardApis)
app.use("/api/user",authApis)

// Server Launch
app.listen(PORT,()=>{
    console.log(`Server is Running on port : ${PORT}`);
})