const mongoose = require('mongoose');


const PIC_Schema = new mongoose.Schema({
      name: String,
      alt: String,
      img: {
        data: Buffer,
        contentType: String
    }

},{timestamps:true , collection:"Employees"})


const Profile_PIC_Schema = new mongoose.Schema({
    
    
      
        emp_email: {type:String, required:true},
        emp_pic: PIC_Schema
      
    
    
},{timestamps:true , collection:"Employees"})

module.exports = mongoose.model("Image",Profile_PIC_Schema);

