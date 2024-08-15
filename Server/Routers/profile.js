const router = require("express").Router();
const multer = require('multer');
const { GridFsStorage } = require("multer-gridfs-storage");
const Employees_Img_module = require("../Models/Profile_Pic");
const mongo_url = process.env.EMS_MongoDB;
const mimetypes = new Set(["image/jpeg" ,"image/JPEG" , "image/png" , "image/jpg" , "image/JPG" , "image/PNG"]);
const conect_mongodb = require("../Utils/connect_mongodb");
const conect_bucket  = require("../Utils/connect_mongo_bucket");
const deleteFromBucket = require("../middlewares/deleteFromBucket");
const createUser = require("../middlewares/createUser");
let gfs_bucket;
async  function initializeConnectionMDB(){
    const db = await conect_mongodb(process.env.EMS_MongoDB);
    // connects uploads bucket
    const bucket = await conect_bucket(db , "uploads");
    return bucket
}
// initialize connections and return bucket for operations on it
initializeConnectionMDB().then(bucket => gfs_bucket = bucket)

const storage = new GridFsStorage({
    url: mongo_url, 
    file: (req, file) => {
      if ( mimetypes.has(file.mimetype)) {
        const obj = {
            bucketName: "uploads",
            filename:`${Date.now()}_${file.originalname}`
          }
        return obj;
      } else {
        return null // if type isn't matched return null
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