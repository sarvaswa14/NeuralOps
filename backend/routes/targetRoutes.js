const express = require('express')
const router = express.Router()
const axios = require('axios')
const protect = require('../middleware/protect')
router.use(protect)
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:4000/health')
    res.json(response.data)
  } catch (error) {
    res.status(500).json()
  }
})
router.post('/break', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:4000/admin/break', req.body)
    res.json(response.data)
  } catch (error) {
    res.status(500).json()
  }
})
router.post('/heal', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:4000/admin/heal', req.body)
    res.json(response.data)
  } catch (error) {
    res.status(500).json()
  }
})
router.get('/modes', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:4000/admin/modes')
    res.json(response.data)
  } catch (error) {
    res.status(500).json()
  }
})
module.exports = router