const jwt = require("jsonwebtoken");


function createToken(id,email){

    const token = jwt.sign({id,email},{ expiresIn: '10m' })

    return token
}