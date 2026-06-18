const Groq = require('groq-sdk')
const { toolDefinitions, toolImplementations } = require('./tools')
const LearningStore = require('../models/learningStore')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const systemInstruction = 'You are NeuralOps Agent, an autonomous SRE. Investigate anomalies and take corrective action. Call read_logs and get_metrics first. State confidence 0-1 before fixing. If confidence below 0.75, call send_alert and stop. Never repeat same tool call twice.'

async function getPastLearnings(anomalyType) {
  try {
    const learnings = await LearningStore.find({ anomalyType }).sort({ createdAt: -1 }).limit(3)
    if (!learnings.length) return 'No past learnings.'
    return learnings.map((l, i) => `Learning ${i+1}: Symptoms: ${l.symptoms?.join(', ')}. Root Cause: ${l.rootCause?.slice(0, 200)}. Fix: ${l.fixApplied}`).join('\n')
  } catch {
    return 'No past learnings.'
  }
}

exports.runAgentLoop = async (incidentContext, onStep) => {
  const pastLearnings = await getPastLearnings(incidentContext.anomalyType)

  const conversationHistory = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: `Anomaly detected. Context: service=${incidentContext.service}, anomalyScore=${incidentContext.anomalyScore}, anomalyType=${incidentContext.anomalyType}. Past learnings: ${pastLearnings}` }
  ]

  let iterations = 0
  const maxIterations = 8

  while (iterations < maxIterations) {
    iterations++

    let response
    try {
      response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: conversationHistory,
        tools: toolDefinitions,
        tool_choice: 'auto',
        parallel_tool_calls: false,
        max_tokens: 1024
      })
    } catch (err) {
      return `Agent stopped: ${err.message}`
    }

    const assistantMessage = response.choices[0].message
    conversationHistory.push(assistantMessage)

    const toolCalls = assistantMessage.tool_calls
    if (!toolCalls || toolCalls.length === 0) {
      return assistantMessage.content
    }

    const toolResponses = []

    for (const call of toolCalls) {
      const { id, function: { name, arguments: argsString } } = call
      let args
      try {
        args = JSON.parse(argsString)
      } catch {
        args = {}
      }

      const implementation = toolImplementations[name]
      let output

      if (!implementation) {
        output = { error: `Tool ${name} not found` }
      } else {
        try {
          output = await implementation(args)
        } catch (error) {
          output = { error: error.message }
        }
      }

      const outputStr = JSON.stringify(output).slice(0, 2000)

      toolResponses.push({
        role: 'tool',
        tool_call_id: id,
        name,
        content: outputStr
      })

      if (onStep) {
        await onStep(name, args, output)
      }
    }

    conversationHistory.push(...toolResponses)
  }

  return 'Agent loop completed.'
}