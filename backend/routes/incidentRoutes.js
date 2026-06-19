const express = require('express')
const router = express.Router()
const incidentController = require('../controllers/incidentController')
const Incident = require('../models/incident')
const AgentStep = require('../models/agentStep')
const protect = require('../middleware/protect')

router.use(protect)

router.delete('/all', async (req, res) => {
  try {
    await Incident.deleteMany({})
    await AgentStep.deleteMany({})
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id)
    await AgentStep.deleteMany({ incidentId: req.params.id })
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.route('/summary').get(incidentController.getSummary)
router.route('/').get(incidentController.getAllIncidents)
router.route('/:id').get(incidentController.getIncidentById)
router.route('/:id/steps').get(incidentController.getIncidentSteps)
router.route('/:id/escalate').post(incidentController.escalateIncident)
router.route('/:id/resolve').post(incidentController.resolveIncident)

module.exports = router