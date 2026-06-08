const { Queue } = require('bullmq')
const connection = { url: process.env.REDIS_URL }
const metricsQueue = new Queue('metrics-queue', { connection })
const investigationQueue = new Queue('investigation-queue', { connection })
const notificationQueue = new Queue('notification-queue', { connection })
module.exports = {
  metricsQueue,
  investigationQueue,
  notificationQueue
}
