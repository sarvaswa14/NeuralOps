const axios = require('axios')
const MetricSnapshot = require('../models/MetricSnapshot')
const LogEntry = require('../models/LogEntry')

const TARGET_URL = 'http://localhost:4000'

const collectLogs = async () => {
    try {
    const [metricsRes, healthRes] = await Promise.all([
      axios.get('http://localhost:4000/metrics'),
      axios.get('http://localhost:4000/health')
    ])

    const metricSnapshot = new MetricSnapshot({
      ...metricsRes.data,
      service: 'api-server'
    })
    await metricSnapshot.save()

    const logEntry = new LogEntry({
      service: 'api-server',
      level: healthRes.data.status === 'ok' ? 'info' : 'error',
      message: `health check ${healthRes.data.status}`,
      metadata: healthRes.data,
      timestamp: new Date()
    })
    await logEntry.save()

  } catch (error) {
    
  }
}

setInterval(collectLogs, 10000)

module.exports = collectLogs