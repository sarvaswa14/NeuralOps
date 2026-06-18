const Incident = require('../models/incident')
const AgentStep = require('../models/agentStep')

exports.getAllIncidents = async (req, res) => {
  try {
    const { status, limit = 100 } = req.query
    const query = status ? { status } : {}
    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
    return res.status(200).json({ incidents })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
    if (!incident) return res.status(404).json({ message: 'Incident not found' })
    return res.status(200).json({ incident })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getIncidentSteps = async (req, res) => {
  try {
    const steps = await AgentStep.find({ incidentId: req.params.id })
      .sort({ timestamp: 1 })
    return res.status(200).json({ steps })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getSummary = async (req, res) => {
  try {
    const openIncidents = await Incident.countDocuments({
      status: { $in: ['investigating', 'fixing', 'verifying', 'escalated'] }
    })
    const agentStepsToday = await AgentStep.countDocuments({
      timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
    const resolved = await Incident.find({ status: 'resolved', resolvedAt: { $exists: true } })
    const total = await Incident.countDocuments()
    const resolutionRate = total > 0 ? (resolved.length / total) * 100 : 0
    const meanRecoveryMs = resolved.length > 0
      ? resolved.reduce((acc, inc) => {
          return acc + (new Date(inc.resolvedAt) - new Date(inc.createdAt))
        }, 0) / resolved.length
      : 0

    return res.status(200).json({
      openIncidents,
      agentActionsToday: agentStepsToday,
      resolutionRate,
      meanRecoveryMs
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.escalateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: 'escalated' },
      { new: true }
    )
    if (!incident) return res.status(404).json({ message: 'Incident not found' })
    return res.status(200).json({ incident })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    )
    if (!incident) return res.status(404).json({ message: 'Incident not found' })
    return res.status(200).json({ incident })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}