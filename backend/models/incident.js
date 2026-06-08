const mongoose = require('mongoose')
const incidentSchema = new mongoose.Schema({
    status:{type : String , enum :['detecting','investigating','fixing','verifying','resolved','escalated']},
    triggeredBy : {type: mongoose.Schema.Types.ObjectId, ref: 'MetricSnapshot'},
    anomalyScore : {type : Number},
    anomalyType : { type : String},
    hypotheses : {type : Array},
    selectedHypothesis : { type : Object},
    actionTaken : { type : String},
    actionResult : {type : String},
    verificationResult : { type : Object},
    postMortem : { type: Object},
    agentLog : { type : Array},
    resolvedAt: {  type : Date},
    createdAt : { type: Date , default : Date.now}
})
module .exports = mongoose.model('incident',incidentSchema)