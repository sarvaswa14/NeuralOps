const express = require('express')
const router = express.Router()
const failureState = require('./failureState')

router.get('/health', (req, res) => {
  if (failureState.HIGH_ERROR_RATE && Math.random() < 0.5) {
    return res.status(500).json({ status: 'error', message: 'simulated crash' })
  }
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

router.get('/api/process', async (req, res) => {
  if (failureState.SLOW_RESPONSE) {
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
  res.status(200).json({ result: 'processed', timestamp: Date.now() })
})

router.get('/api/data', (req, res) => {
  if (failureState.DB_CORRUPTION) {
    return res.status(200).json({ data: null, corrupted: true, error: 'malformed response' })
  }
  res.status(200).json({ data: [1, 2, 3], corrupted: false })
})

router.get('/metrics', (req, res) => {
  const base = {
    cpu: parseFloat((Math.random() * 30 + 10).toFixed(1)),
    memory: parseFloat((Math.random() * 200 + 300).toFixed(1)),
    errorRate: parseFloat((Math.random() * 0.5).toFixed(2)),
    avgResponseTime: parseFloat((Math.random() * 200 + 100).toFixed(1)),
    requestCount: Math.floor(Math.random() * 100 + 50)
  }

  if (failureState.HIGH_ERROR_RATE) base.errorRate = parseFloat((Math.random() * 30 + 40).toFixed(2))
  if (failureState.MEMORY_LEAK) base.memory = parseFloat((base.memory + Math.random() * 200 + 300).toFixed(1))
  if (failureState.SLOW_RESPONSE) base.avgResponseTime = parseFloat((Math.random() * 4000 + 8000).toFixed(1))

  res.status(200).json(base)
})

router.post('/admin/break', (req, res) => {
  const { mode } = req.body
  if (!failureState.hasOwnProperty(mode)) {
    return res.status(400).json({ error: 'unknown failure mode' })
  }
  failureState[mode] = true
  res.status(200).json({ activated: mode, state: failureState })
})

router.post('/admin/heal', (req, res) => {
  Object.keys(failureState).forEach(key => failureState[key] = false)
  res.status(200).json({ healed: true, state: failureState })
})

router.get('/admin/modes', (req, res) => {
  res.status(200).json(failureState)
})

module.exports = router