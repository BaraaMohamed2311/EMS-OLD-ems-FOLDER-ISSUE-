const mongoose = require("mongoose");

    function connectMongoDB(){
        mongoose.connect(process.env.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
        .then(() => console.log('Connected To MongoDB EMS '))
        .catch((err) => console.log('Error Connecting To MongoDB EMS '));
    }





module.exports = connectMongoDB;