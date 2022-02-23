const jwt = require('jsonwebtoken');
const Author = require('../models/author')
const userAuth = async(req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','');
            // to get author id
        const decode = jwt.verify(token,process.env.Jwt_Security)
        //find author that have same id(decode) and token
        const author = await Author.findOne({_id:decode._id,tokens:token})
        if(!author){
            throw new Error('not authorized plz login')
        }
        req.author = author
        req.token = token
        //next to complete and return to route
        next()
    }
    catch(e){
        res.status(401).send('not authorized')
    }
}
const adminAuth = async(req,res,next)=>{
    try{
        if(req.author.role !=='admin'){
            return req.status(401).send('not authorized ..You are not admin')
        }
        next()
    }

    catch(e){
        res.status(401).send('not admin authorized')
    }
}
module.exports = {
    userAuth,adminAuth
};