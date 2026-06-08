const { Worker } = require('bullmq')

const connection = { url: process.env.REDIS_URL }

const metricsWorker = new Worker('metrics-queue', async (job) => {

}, { connection })

module.exports = metricsWorker
