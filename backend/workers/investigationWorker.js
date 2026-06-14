const dotenv = require('dotenv')
dotenv.config()
const Incident = require('../models/incident')
const AgentStep = require('../models/agentStep')
const LearningStore = require('../models/learningStore')
const {runAgentLoop} = require('../agent-core/loop')
const {parseConfidence} = require('../agent-core/confidence')
const {generatePostMortem} = require('../agent-core/postmortem')
const {getIO} = require('../socket')
const { Worker } = require('bullmq')
const connection = { url: process.env.REDIS_URL }

const investigationWorker = new Worker('investigation-queue', async (job) => {
  console.log('worker received job:', job.id, job.data)
  let incident
  try {
    const { service, anomalyScore, anomalyType } = job.data
    incident = await Incident.create({
      service,
      status: 'investigating',
      anomalyScore,
      anomalyType
    })
    console.log('incident created:', incident._id)
    const io = getIO()
    io.emit('incident:created', incident)
    const agentResponse = await runAgentLoop({
      service,
      anomalyScore,
      anomalyType,
      incidentId: incident._id
    }, async (name, args, output) => {
      console.log('tool called:', name, 'output:', JSON.stringify(output).slice(0, 100))
      const liveStep = await AgentStep.create({
        incidentId: incident._id,
        stepType: 'investigate',
        toolCalled: name,
        toolInput: args,
        toolOutput: output
      })
      io.emit('step:added', liveStep)
    })
    const agentStep = await AgentStep.create({
      incidentId: incident._id,
      stepType: 'decide',
      agentReasoning: agentResponse
    })
    io.emit('step:added', agentStep)
    const { confidence, shouldAct } = parseConfidence(agentResponse)
    if (!shouldAct) {
      const updatedIncident = await Incident.findByIdAndUpdate(
        incident._id,
        { status: 'escalated' },
        { new: true }
      )
      io.emit('incident:updated', updatedIncident)
    } else {
      let updatedIncident = await Incident.findByIdAndUpdate(
        incident._id,
        { status: 'fixing' },
        { new: true }
      )
      io.emit('incident:updated', updatedIncident)
      await new Promise(resolve => setTimeout(resolve, 60000))
      updatedIncident = await Incident.findByIdAndUpdate(
        incident._id,
        { status: 'verifying' },
        { new: true }
      )
      io.emit('incident:updated', updatedIncident)
      updatedIncident = await Incident.findByIdAndUpdate(
        incident._id,
        {
          status: 'resolved',
          resolvedAt: new Date(),
          actionTaken: 'auto'
        },
        { new: true }
      )
      io.emit('incident:updated', updatedIncident)
      const steps = await AgentStep.find({ incidentId: incident._id })
      const postMortemResult = generatePostMortem(updatedIncident, steps)
      updatedIncident.postMortem = postMortemResult
      await updatedIncident.save()
      const symptoms = steps
        .filter(step => step.stepType === 'investigate' && step.toolCalled)
        .map(step => step.toolCalled)
      await LearningStore.create({
        anomalyType: updatedIncident.anomalyType,
        symptoms,
        rootCause: agentResponse,
        fixApplied: updatedIncident.actionTaken,
        fixSucceeded: true,
        timeToResolve: postMortemResult.timeToResolve
      })
    }
  } catch (error) {
    console.log('worker error:', error.message, error.stack)
    if (incident?._id) {
      await Incident.findByIdAndUpdate(
        incident._id,
        { status: 'escalated' }
      )
      const io = getIO()
      io.emit('incident:updated', { _id: incident._id, status: 'escalated' })
    }
  }
}, { connection })

module.exports = investigationWorker