const express = require('express')
const router = express.Router()
const MetricSnapshot = require('../models/MetricSnapshot') 
const protect = require('../middleware/protect') 

router.use(protect)

router.get('/latest', async (req, res) => {
  try {
    const latest = await MetricSnapshot.findOne().sort({ timestamp: -1 })
    res.json(latest)
  } catch (error) {
    res.status(500).json()
  }
})

router.get('/history', async (req, res) => {
  try {
    const { service, from, to } = req.query
    const query = {}

    if (service) {
      query.service = service
    }

    if (from || to) {
      query.timestamp = {}
      if (from) query.timestamp.$gte = new Date(from)
      if (to) query.timestamp.$lte = new Date(to)
    }

    const history = await MetricSnapshot.find(query).sort({ timestamp: 1 })
    res.json(history)
  } catch (error) {
    res.status(500).json()
  }
})

router.get('/anomalies', async (req, res) => {
  try {
    const anomalies = await MetricSnapshot.find({ anomalyScore: { $gt: 0.7 } }).sort({ timestamp: -1 })
    res.json(anomalies)
  } catch (error) {
    res.status(500).json()
  }
})

module.exports = router
