const axios = require('axios')
const MetricSnapshot = require('../models/metricSnapshot')
const LogEntry = require('../models/logEntry')
const { getIO } = require('../socket')

const TARGET_URL = process.env.TARGET_APP_URL || 'http://localhost:4000'

const collectLogs = async () => {
  try {
    const metricsRes = await axios.get(`${TARGET_URL}/metrics`)
    const metricSnapshot = new MetricSnapshot({
      ...metricsRes.data,
      service: 'api-server',
      timestamp: new Date()
    })
    await metricSnapshot.save()

    try {
      const io = getIO()
      io.emit('metrics:updated', {
        errorRate: metricsRes.data.errorRate,
        avgResponseTime: metricsRes.data.avgResponseTime,
        memoryUsage: metricsRes.data.memory,
        cpuUsage: metricsRes.data.cpu,
      })
    } catch {}

  } catch (error) {
    console.log('logCollector metrics error:', error.message)
  }

  try {
    const healthRes = await axios.get(`${TARGET_URL}/health`)
    const logEntry = new LogEntry({
      service: 'api-server',
      level: healthRes.data.status === 'ok' ? 'info' : 'error',
      message: `health check ${healthRes.data.status}`,
      metadata: healthRes.data,
      timestamp: new Date()
    })
    await logEntry.save()
  } catch (error) {
    console.log('logCollector health error:', error.message)
  }
}

setInterval(collectLogs, 10000)

module.exports = collectLogs