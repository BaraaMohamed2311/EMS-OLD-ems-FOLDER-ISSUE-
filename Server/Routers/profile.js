const router = require("express").Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const { GridFsStorage } = require("multer-gridfs-storage")
// const Emp_Pic_Model = require("../Models/Profile_Pic")
const mongo_url = process.env.MongoDB;
console.log("mongo_url",mongo_url)
const storage = new GridFsStorage({
    url: mongo_url, 
    file: (req, file) => {
        console.log("file in grid " , file)
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        const obj = {
            bucketName: "photos",
            filename:`${Date.now()}_${file.originalname}`
          }

          console.log("file obj", obj)
        return obj;
      } else {
        //Otherwise save to default bucket
        return `${Date.now()}_${file.originalname}`
      }
    },
});

  const upload = multer({ storage })


// Update User Data
router.put("/pic",upload.single('emp_img'),async (req,res)=>{
    try{
        const file = req.file
        console.log("file",file)
        // Respond with the file details
        if (!file) {
            throw new Error("File upload failed");
        }

        // Respond with the file details
        res.send({
            success: true,
            message: "Employee Profile Pic Uploaded Successfully",
            name: file.filename,
            contentType: file.contentType,
        });
    }
    catch(err){
        console.log("Error Update Profile Picture",err);
        res.json({
            success:false,
            message:"Error Update Profile Picture"
        })
    }
})


module.exports = router;