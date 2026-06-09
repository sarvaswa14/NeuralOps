const dotenv = require('dotenv')
const mongoose = require('mongoose')
const { runAgentLoop } = require('./loop')
 dotenv.config()
console.log('KEY LENGTH:', process.env.GEMINI_API_KEY?.length)
async function testAgent() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        
        const fakeIncident = {
            service: 'api-server',
            anomalyScore: 0.85,
            anomalyType: 'HIGH_ERROR_RATE'
        }
        
        const result = await runAgentLoop(fakeIncident)
        console.log(result)
    } catch (error) {
        console.log(error.message)
    } finally {
        await mongoose.disconnect()
    }
}
testAgent()