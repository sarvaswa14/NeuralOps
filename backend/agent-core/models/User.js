const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {type : String, required: true},
    email :{type: String, unique: true , indexed: true ,required : true,lowercase : true},
    passwordHash : { type : String,},
    role : { type : String , enum : ['admin','viewer'],default : 'viewer'},
    createdAt:{ type : Date, default : Date.now},
    googleId : { type : String },
    githubId : { type : String },
})

module.exports = mongoose.model('User', userSchema)