const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authorSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,    
    },
    age:{
        type:Number,
        trim:true,
        required:true,
        validate(value){
            if(value<=0){
                throw new Error('age is invalid')
            }
        }
    },
    address:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ('email invalid')
            }
        }
    },
    phone:{
        type:String,
        trim:true,
        required:true,
        validate(value){
            let regExp = new RegExp('^01[0-2,5]{1}[0-9]{8}$')
            if(!regExp.test(value)){
                throw new Error('phone number invalid plz provide Egypt phone number')
            }        
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            //check password validation with regular expression
            let regExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
            if(!regExp.test(value)){
                throw new Error('invalid password it must contain uppercase lowercase special charachter')
            } 
        }
    },
    image:{
        type:Buffer
    },
    role:{
        type:String,
        enum:['admin','author'],
        default:'author'       
    },
    tokens:[
        {
            type:String,
            required:true
        }
    ]

})
//authorScehma.statics  ===> on model
authorSchema.statics.findByCredintals = async (email,password)=>{
    const author =await Author.findOne({email})
    console.log(author)
    if(!author){
        throw new Error('unable to login plz check email and password')
    }
    const isMatch = await bcrypt.compare(password,author.password)
    if(!isMatch){
        throw new Error('unable to login plz check email and password')
    }
    return author
}
//authorSchema.methods   ===> on variables
authorSchema.methods.generateToken = async function(){
    const author = this;
    const token = jwt.sign({_id:author._id.toString()},process.env.Jwt_Security);
    author.tokens = author.tokens.concat(token)
    await author.save()
    return token;
}
authorSchema.pre('save',async function(){
    const author = this;
    if(author.isModified('password')){
        author.password = await bcrypt.hash(author.password,8)
    }
})
//to link author with news to get all news 
authorSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
})
const Author = mongoose.model('Author',authorSchema)
module.exports = Author;