const mongoose = require('mongoose')
const deploymentSchema = new mongoose.Schema({
    version : { type : String},
    service : { type: String},
    deployedAt : { type : Date},
    deployedBy: { type : String},
    status : { type : String,enum : ['success','failed','rolled_back']},
    changelog: { type: String}
})
module.exports =  mongoose.models.deployment ||mongoose.model('deployment',deploymentSchema)