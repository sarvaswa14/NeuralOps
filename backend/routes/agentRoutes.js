const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
const protect = require('../middleware/protect')

router.use(protect)

router.get('/steps/recent', async (req, res) => {
  try {
    const AgentStep = require('../models/agentStep')
    const steps = await AgentStep.find()
      .sort({ createdAt: -1 })
      .limit(20)
    res.json({ steps })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})
router.route('/status')
    .get(agentController.getAgentStatus)

router.route('/trigger')
    .post(agentController.triggerAgent)

router.route('/learning')
    .get(agentController.getLearning)

module.exports = router
