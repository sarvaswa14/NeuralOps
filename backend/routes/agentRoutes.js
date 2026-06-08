const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
const protect = require('../middleware/protect')

router.use(protect)

router.route('/status')
    .get(agentController.getAgentStatus)

router.route('/trigger')
    .post(agentController.triggerAgent)

router.route('/learning')
    .get(agentController.getLearning)

module.exports = router
