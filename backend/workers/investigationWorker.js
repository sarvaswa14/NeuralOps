const { Worker } = require('bullmq')

const connection = { url: process.env.REDIS_URL }

const investigationWorker = new Worker('investigation-queue', async (job) => {

}, { connection })

module.exports = investigationWorker
