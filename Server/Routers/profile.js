const router = require("express").Router();

/*User only get or update his data from profile page */

// GET User Data
router.get((req,res)=>{
    try{

    }
    catch(err){
        console.log("Error Get Profile Data");
        res.json({
            success:false,
            message:"Error Get Profile Data"
        })
    }
})


// Update User Data
router.put((req,res)=>{
    try{

    }
    catch(err){
        console.log("Error Update Profile Data");
        res.json({
            success:false,
            message:"Error Update Profile Data"
        })
    }
})


module.exports = router;