const mongoose = require('mongoose')
const metricSnapshotSchema = new mongoose.Schema({
    service: { type: String },
    cpu: { type: Number },
    memory: { type: Number },
    errorRate: { type: Number },
    avgResponseTime: { type: Number },
    requestCount: { type: Number },
    anomalyScore: { type: Number },
    anomalyType: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
})
module.exports = mongoose.models.metricSnapshot || mongoose.model('metricSnapshot', metricSnapshotSchema)