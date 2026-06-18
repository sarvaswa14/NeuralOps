const mongoose = require('mongoose')
const learningStoreSchema = new mongoose.Schema({
    anomalyType : { type : String},
    symptoms : { type : Array},
    rootCause : { type: String},
    createdAt : { type : Date,default : Date.now},
    fixApplied: { type : String},
    fixSucceeded: { type : Boolean},
    timeToResolve : {type : Number}
})
module.exports = mongoose.model('learningStore',learningStoreSchema)