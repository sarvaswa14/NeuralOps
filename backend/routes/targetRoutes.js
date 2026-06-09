const express = require('express')
const router = express.Router()
const axios = require('axios')
const protect = require('../middleware/protect')

const TARGET_URL = process.env.TARGET_APP_URL || 'http://target-app:4000'

router.use(protect)

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${TARGET_URL}/health`)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code, url: error.config?.url })
  }
})

router.post('/break', async (req, res) => {
  try {
    const response = await axios.post(`${TARGET_URL}/admin/break`, req.body)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code, url: error.config?.url })
  }
})

router.post('/heal', async (req, res) => {
  try {
    const response = await axios.post(`${TARGET_URL}/admin/heal`, req.body)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code, url: error.config?.url })
  }
})

router.get('/modes', async (req, res) => {
  try {
    const response = await axios.get(`${TARGET_URL}/admin/modes`)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code, url: error.config?.url })
  }
})

module.exports = router