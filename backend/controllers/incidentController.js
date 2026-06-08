const Incident = require('../models/incident')
const AgentStep = require('../models/agentStep')
exports.getAllIncidents = async (req, res) => {
    try {
        const { status } = req.query
        const query = status ? { status } : {}
        
        const incidents = await Incident.find(query).sort({ createdAt: -1 })
        return res.status(200).json(incidents)
    } catch (error) {
        return res.status(500).json()
    }
}
exports.getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' })
        }
        return res.status(200).json(incident)
    } catch (error) {
        return res.status(500).json()
    }
}
exports.getIncidentSteps = async (req, res) => {
    try {
        const steps = await AgentStep.find({ incidentId: req.params.id }).sort({ createdAt: 1 })
        return res.status(200).json(steps)
    } catch (error) {
        return res.status(500).json()
    }
}
exports.escalateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { status: 'escalated' },
            { new: true, runValidators: true }
        )
        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' })
        }
        return res.status(200).json(incident)
    } catch (error) {
        return res.status(500).json()
    }
}
exports.resolveIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'resolved',
                resolvedAt: new Date()
            },
            { new: true, runValidators: true }
        )
        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' })
        }
        return res.status(200).json(incident)
    } catch (error) {
        return res.status(500).json()
    }
}