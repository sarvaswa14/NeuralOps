const Incident = require('../models/incident')
const LearningStore = require('../models/learningStore')
exports.getAgentStatus = async (req, res) => {
    try {
        const activeIncident = await Incident.findOne({ status: { $ne: 'resolved' } }).sort({ createdAt: -1 })
        const lastResolved = await Incident.findOne({ status: 'resolved' }).sort({ resolvedAt: -1 })
        
        return res.status(200).json({
            status: 'running',
            activeIncident,
            lastResolved
        })
    } catch (error) {
        return res.status(500).json()
    }
}
exports.triggerAgent = async (req, res) => {
    try {
        return res.status(200).json({ message: 'Trigger received' })
    } catch (error) {
        return res.status(500).json()
    }
}
exports.getLearning = async (req, res) => {
    try {
        const learningEntries = await LearningStore.find().sort({ createdAt: -1 })
        return res.status(200).json(learningEntries)
    } catch (error) {
        return res.status(500).json()
    }
}