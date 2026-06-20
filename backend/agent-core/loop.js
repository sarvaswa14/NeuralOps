const Groq = require('groq-sdk')
const { toolDefinitions, toolImplementations } = require('./tools')
const LearningStore = require('../models/learningStore')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const systemInstruction = `You are NeuralOps, an autonomous incident response agent.

RULES — follow exactly:
1. Call ONE tool at a time, never multiple
2. Only use these tools: read_logs, get_metrics, check_deployments, query_database, restart_service, rollback_deployment, scale_service, send_alert
3. Never invent tool names
4. Always start with read_logs, then get_metrics
5. After investigating, state your confidence (0.0 to 1.0)
6. If confidence >= 0.75: call the appropriate fix tool (restart_service, rollback_deployment, or scale_service)
7. If confidence < 0.75: call send_alert then stop
8. Never call the same tool twice with the same parameters`

async function getPastLearnings(anomalyType) {
  try {
    const learnings = await LearningStore.find({ anomalyType }).sort({ createdAt: -1 }).limit(3)
    if (!learnings.length) return 'No past learnings.'
    return learnings.map((l, i) =>
      `Learning ${i+1}: Symptoms: ${l.symptoms?.join(', ')}. Root Cause: ${l.rootCause?.slice(0, 150)}. Fix: ${l.fixApplied}`
    ).join('\n')
  } catch {
    return 'No past learnings.'
  }
}

exports.runAgentLoop = async (incidentContext, onStep) => {
  const pastLearnings = await getPastLearnings(incidentContext.anomalyType)

  const conversationHistory = [
    { role: 'system', content: systemInstruction },
    {
      role: 'user',
      content: `Incident detected. service=${incidentContext.service}, anomalyType=${incidentContext.anomalyType}, anomalyScore=${incidentContext.anomalyScore}.\n\nPast learnings (use as context only, do not copy actions blindly):\n${pastLearnings}\n\nYou MUST call read_logs first. Then call get_metrics. Only after both tool results, decide what to do.`
    }
  ]

  let iterations = 0
  const maxIterations = 10

  while (iterations < maxIterations) {
    iterations++

    let response
    try {
      response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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
        output = { error: `Unknown tool: ${name}. Only use: read_logs, get_metrics, check_deployments, query_database, restart_service, rollback_deployment, scale_service, send_alert` }
      } else {
        try {
          output = await implementation(args)
        } catch (error) {
          output = { error: error.message }
        }
      }

      toolResponses.push({
        role: 'tool',
        tool_call_id: id,
        name,
        content: JSON.stringify(output).slice(0, 2000)
      })

      if (onStep) {
        await onStep(name, args, output)
      }
    }

    conversationHistory.push(...toolResponses)
  }

  return 'Agent loop completed.'
}