const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
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
require('./workers/metricsWorker')
require('./workers/investigationWorker')

const app = express()
const server = http.createServer(app)

initSocket(server)

app.use(express.json())
app.use(cors())
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

server.listen(process.env.PORT)
