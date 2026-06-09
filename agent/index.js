const { Worker } = require('bullmq')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { runAgentLoop } = require('./loop')
dotenv.config()
mongoose.connect(process.env.MONGO_URI)
    .catch((err) => {
    })
const worker = new Worker(
    'investigation-queue',
    async (job) => {
        const incidentContext = job.data
        const result = await runAgentLoop(incidentContext)
        return result
    },
    {
        connection: {
            url: process.env.REDIS_URL
        }
    }
)
module.exports = worker