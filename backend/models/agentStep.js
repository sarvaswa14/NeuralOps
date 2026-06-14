const mongoose = require('mongoose')
const agentStepSchema = new mongoose.Schema({
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    stepType: { type: String, enum: ['observe', 'hypothesize', 'investigate', 'decide', 'fix', 'verify', 'escalate'] },
    toolCalled: { type: String },
    toolInput: { type: Object },
    toolOutput: { type: Object },
    agentReasoning: { type: String },
    confidenceScore: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true }
})

module.exports = mongoose.models.agentStep || mongoose.model('agentStep', agentStepSchema)