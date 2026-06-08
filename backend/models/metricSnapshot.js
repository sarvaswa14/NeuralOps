const mongoose = require('mongoose')
const metricSnapshotSchema = new mongoose.Schema({
    service : {type : String},
    cpu : { type : Number},
    memory : { type : Number},
    errorRate : {type : Number},
    avgResponseTime :{ type : Number},
    requestCount : {type : Number},
    anomalyScore: {type : Number},
    timestamp : { type : Date, index : true}
})
module.exports = mongoose.model('metricSnapshot',metricSnapshotSchema)