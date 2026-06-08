const mongoose = require('mongoose')
const logEntrySchema = new mongoose.Schema({
    service :{type : String},
    level : { type : String, enum: ['info','warn','error','fatal']},
    message : { type: String},
    metadata : {type : Object},
    timestamp : { type : Date,index : true},
    incidentId : {type: mongoose.Schema.Types.ObjectId, ref: 'Incident'}
})
module.exports = mongoose.model('logEntry',logEntrySchema)