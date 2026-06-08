const express = require('express')
const router = express.Router()
const LogEntry = require('../models/LogEntry')
const protect = require('../middleware/protect')
router.use(protect)
router.get('/', async (req, res) => {
  try {
    const { level, service, from, to, limit } = req.query
    const query = {}
    if (level) {
      query.level = level
    }
    if (service) {
      query.service = service
    }
    if (from || to) {
      query.timestamp = {}
      if (from) query.timestamp.$gte = new Date(from)
      if (to) query.timestamp.$lte = new Date(to)
    }
    const parsedLimit = parseInt(limit, 10) || 50
    const logs = await LogEntry.find(query)
      .sort({ timestamp: -1 })
      .limit(parsedLimit)
    res.json(logs)
  } catch (error) {
    res.status(500).json()
  }
})
router.get('/incident/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params
    const logs = await LogEntry.find({ incidentId }).sort({ timestamp: 1 })
    res.json(logs)
  } catch (error) {
    res.status(500).json()
  }
})
module.exports = router