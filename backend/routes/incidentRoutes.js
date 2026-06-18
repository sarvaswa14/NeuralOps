const express = require('express')
const router = express.Router()
const incidentController = require('../controllers/incidentController')
const protect = require('../middleware/protect')

router.use(protect)

router.route('/summary').get(incidentController.getSummary)
router.route('/').get(incidentController.getAllIncidents)
router.route('/:id').get(incidentController.getIncidentById)
router.route('/:id/steps').get(incidentController.getIncidentSteps)
router.route('/:id/escalate').post(incidentController.escalateIncident)
router.route('/:id/resolve').post(incidentController.resolveIncident)

module.exports = router