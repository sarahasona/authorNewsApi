
const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth')
const News = require('../models/news')
//create new author new
router.post('/new', auth.userAuth, async (req, res) => {
    try {
        const news = new News({ ...req.body, owner: req.author._id })
        await news.save()
        res.status(200).send(news)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})
//get all news to admin
router.get('/allNews',auth.userAuth,auth.adminAuth,async(req,res)=>{
    try{
        const news = await News.find({})
        if(!news){
            return res.status(404).send('no data avaliable')
        }
        for(i=0;i<news.length;i++){
            await news[i].populate('owner')
        }
        res.status(200).send(news)

    }
    catch(e){
        res.status(500).send(e.message)
    }
})
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
            cb(new Error('plz upload image'))
        }
        //null means no error .. true means upload image type
        cb(null, true)
    }
})
//upload image of news 
router.post('/new/image/:id', upload.single('image'), auth.userAuth, async (req, res) => {
    try {
        const reqNews = await News.findOne({ _id: req.params.id, owner: req.author._id })
        if (!reqNews) {
            return res.status(400).send('new new found')
        }
        reqNews.image = req.file.buffer
        await reqNews.save()
        res.status(200).send(reqNews)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})
//get data of specific news
router.get('/new/:id',auth.userAuth,async(req,res)=>{
    try{
        const reqNew = await News.findOne({_id:req.params.id,owner:req.author._id})
        if(!reqNew){
            return res.status(404).send('no new found try again')
        }
        res.status(200).send(reqNew)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//update data of specific news 
router.patch('/new/:id',auth.userAuth,async(req,res)=>{
    try{
        const reqNew = await News.findOne({_id:req.params.id,owner:req.author._id})
        if(!reqNew){
            return res.status(404).send('no new to update try again')
        }
        const updatesKeys = Object.keys(req.body);
        updatesKeys.forEach((ele)=>{
            reqNew[ele] = req.body[ele]
        })
        await reqNew.save()
        res.status(200).send(reqNew)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

//delete specific new 
router.delete('/new/:id',auth.userAuth,async(req,res)=>{
    try{
        const reqNew = await News.findOne({_id:req.params.id,owner:req.author._id})
        if(!reqNew){
            return res.status(404).send('can not delete try again')
        }
        res.status(200).send('Deleted succesfully')
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
//get news author data
router.get('/newsAuthor/:id',auth.userAuth,async(req,res)=>{
    try{
        const reqNews = await News.findOne({_id:req.params.id,owner:req.author._id})
        if(!reqNews){
            return res.status(404).send('news not found try again')        
        }
        await reqNews.populate('owner')
        res.status(200).send(reqNews.owner)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
module.exports = router