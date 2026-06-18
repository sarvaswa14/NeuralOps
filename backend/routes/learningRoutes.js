const express = require('express')
const router = express.Router()
const LearningStore = require('../models/learningStore')
const protect = require('../middleware/protect')

router.use(protect)

router.get('/', async (req, res) => {
  try {
    const learnings = await LearningStore.find().sort({ createdAt: -1 })
    res.json(learnings)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router