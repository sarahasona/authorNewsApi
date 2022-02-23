const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const Author = require('../models/author');
//npm i multer to upload images
const multer = require('multer')

router.post('/signup',async (req,res)=>{
    try{
        const author = new Author(req.body);
        //create new author with tokenes[]
        await author.save()
        //generate token
        const token =await author.generateToken()
        res.status(200).send({author,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
router.get('/login',async(req,res)=>{
    try{
        console.log(req.body)
        const author = await Author.findByCredintals(req.body.email,req.body.password)
        const token = await author.generateToken();
        res.status(200).send({author,token})
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//get all users
router.get('/authors',auth.userAuth,auth.adminAuth,async(req,res)=>{
    try{
        const users = await Author.find({})
        if(!users){
            return res.status(404).send('no users found')
        }
        res.status(200).send(users)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//admin get specific author
router.get('/author/:id',auth.userAuth,auth.adminAuth,async(req,res)=>{
    try{
        const author = await Author.findOne({_id:req.params.id}) 
        if(!author){
            return res.status(404).send(`don"t found try again`)
        }
        res.status(200).send(author)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//admin patch specific author
router.patch('/author/:id',auth.userAuth,auth.adminAuth,async(req,res)=>{
    try{
        const author = await Author.findOne({_id:req.params.id})
        if(!author){
            return res.status(404).send(`error ?? try again can not found`)
        }
        const updates = Object.keys(req.body)
        updates.forEach((ele)=>{
            author[ele] = req.body[ele]
        })
        await author.save()
        res.status(200).send(author)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
router.delete('/author/:id',auth.userAuth,auth.adminAuth,async(req,res)=>{
    try{
        const author = await Author.findByIdAndDelete(req.params.id)
        if(!author){
            return res.status(404).send('error try again')
        }
        res.status(200).send('deleted Successfully ')
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
router.get('/profile',auth.userAuth,async(req,res)=>{
    try{
        const author = await Author.findById(req.author._id)
        if(!author){
            return res.status(404).send('not found plz login')
        }
        res.status(200).send(author)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
router.get('/authorNews',auth.userAuth,async(req,res)=>{
    try{
        await req.author.populate('news')
        res.status(200).send(req.author.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//upload image
const upload = multer({
    //limit size to 1MB
    limits:{
        fileSize:1000000 //1MB = 1000000Byte
    },
    fileFilter (req, file, cb) {
       if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
           cb(new Error('plz upload image'))
       }
       //null means no error .. true means upload image type
       cb(null,true)
    }
})
router.post('/profile/image',auth.userAuth,upload.single('image'),async(req,res)=>{
    try{

        req.author.image = req.file.buffer
        await req.author.save()
        res.status(200).send(req.author)
    }
    catch(e){
        res.status(400).send(e.message)
    }
    
})
///////////////////////////////////////////////////////////////
//edit profile
router.patch('/profile',auth.userAuth,async(req,res)=>{
    try{
        const author = await Author.findById(req.author._id)
        if(!author){
            return res.status(404).send('no author plz try again')
        }
        const updatesKeys = Object.keys(req.body)
        updatesKeys.forEach((ele)=>{
            //ele==>name
            //author[name] = req.body[name]
            author[ele] = req.body[ele]
        })
        await author.save()
        res.status(200).send(author)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
//////////////////////////////////////////////////////////////
//delete profile
router.delete('/profile',auth.userAuth,async(req,res)=>{
    try{
        const author = await Author.findByIdAndDelete(req.author._id)
        if(!author){
            return res.status(404).send('not found can not delete')
        }
        res.status(200).send(author)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

/////////////////////////////////////////////////////////////
router.delete('/logout',auth.userAuth,async(req,res)=>{
    try{
        req.author.tokens = req.author.tokens.filter((ele)=>{
            return ele != req.token
        })
        await req.author.save()
        res.status(200).send('log out successfuly')
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
module.exports = router