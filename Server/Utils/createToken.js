const jwt = require("jsonwebtoken");


function createToken(id,email){

    const token = jwt.sign({id:id,email:email},process.env.SECRET_KEY,{ expiresIn: '30m' })

    return token
}


module.exports = createToken;