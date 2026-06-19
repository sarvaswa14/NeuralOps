const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const http = require('http')
const { initSocket } = require('./socket')
const passport = require('./middleware/passport')
const authRoutes = require('./routes/authRoutes')
const metricsRoutes = require('./routes/metricsRoutes')
const logRoutes = require('./routes/logRoutes')
const targetRoutes = require('./routes/targetRoutes')
const incidentRoutes = require('./routes/incidentRoutes')
const deploymentRoutes = require('./routes/deploymentRoutes')
const agentRoutes = require('./routes/agentRoutes')
const collectLogs = require('./workers/logCollector')
const learningRoutes = require('./routes/learningRoutes')
require('./workers/metricsWorker')
require('./workers/investigationWorker')

const app = express()
const server = http.createServer(app)

initSocket(server)

app.use(express.json())
app.use(cors({
  origin: ['https://neural-ops-gilt.vercel.app', 'http://localhost:5173'],
  credentials: true
}))
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
app.use('/api/', limiter)
app.use('/api/auth', authLimiter)
app.use(passport.initialize())

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    collectLogs()
  })
  .catch((err) => {
  })

app.use('/api/auth', authRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/target', targetRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/deployments', deploymentRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/learning', learningRoutes)

server.listen(process.env.PORT)
