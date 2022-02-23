const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true
    },
    discription:{
        type:String,
        trim:true,
        required:true
    },
    image:{
        type:Buffer
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Author'
    }
})
const News = mongoose.model('News',newsSchema)
module.exports = News