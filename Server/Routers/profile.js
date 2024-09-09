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



/**           Get User Image           **/
// if user doesn't exist create it
  router.get("/prof-img",async (req,res)=>{
    try{ 
        if(gfs_bucket){
        // search for user
        const employee = await Employees_Img_module.findOne({emp_email:req.query["emp_email"]});
        
        // let cursor find and point to it's img in bucket
        if(!employee.emp_pic.file_name){
          res.header("Content-Type", "application/json");
          return res.json({
            success: false,
            message: "User has no image",
        });
        }
        const cursor = await gfs_bucket.find({filename:employee.emp_pic.file_name});
        const docsArray = await cursor.toArray();

        console.log("docsArray",docsArray)
        // we pipe img file by reading from db then writing into response
        if(docsArray[0]){
          gfs_bucket.openDownloadStreamByName(docsArray[0].filename).pipe(res)
          }
          else{
            console.log("Img file not found at GET")
            res.header("Content-Type", "application/json");
            return res.json({
              success: false,
              message: "Image file not found",
          });
          
          }
        }
        else{
          res.header("Content-Type", "application/json");
          return res.json({
              success: false,
              message: "Mongo Bucket is undefined",
          });
        }
        
    }
    catch(err){
        res.header("Content-Type", "application/json");
        console.log("Error GET Profile Picture",err);
        res.json({
            success:false,
            message:"Error GET Profile Picture"
        })
    }
})

/**           Update User Image           **/
/*Steps are 
  Create user doc if not exist => delete old image if it was exist => upload new image =>
    update user data with id of new image */
  /* we create user as it could exist in mysql table but not created and assigned an image in mongodb that's apply to current and new employees */
router.put("/update-prof-img", createUser, async (req , res , next)=> {await deleteFromBucket(gfs_bucket ,req , res , next)} , upload.single('emp_img'),async (req,res)=>{
    try{ 
      console.log("update image requested")
        if(gfs_bucket){
        // find employee and update img file id 
        console.log("file" , req.file) 
        await Employees_Img_module.findOneAndUpdate({emp_email:req.query["emp_email"]},{emp_pic:{ file_name:req.file.filename , ImgId:req.file.id}});
        // we pipe img file by reading from db then writing into response
        gfs_bucket.openDownloadStreamByName(req.file.filename).pipe(res)
        }
        else{
          res.header("Content-Type", "application/json");
          return res.json({
              success: false,
              message: "Mongo Bucket is undefined",
          });
        }
        
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