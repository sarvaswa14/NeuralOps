const Groq = require('groq-sdk')
const { toolDefinitions, toolImplementations } = require('./tools')
const LearningStore = require('./models/learningStore')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const systemInstruction = 'You are NeuralOps Agent, an autonomous SRE. IMPORTANT: Call ONE tool at a time. Never call multiple tools in a single response. Investigate anomalies step by step. First call read_logs, then get_metrics, then decide. State confidence 0-1 before fixing. If confidence below 0.75, call send_alert and stop.'
async function getPastLearnings(anomalyType) {
    try {
        const learnings = await LearningStore.find({ anomalyType })
            .sort({ createdAt: -1 })
            .limit(5)

        if (learnings.length === 0) {
            return 'No past learnings available for this anomaly type.'
        }

        return learnings.map((l, index) => {
            return `Learning ${index + 1}:
Symptoms: ${l.symptoms.join(', ')}
Root Cause: ${l.rootCause}
Fix Applied: ${l.fixApplied}`
        }).join('\n\n')
    } catch (error) {
        return 'Could not retrieve past learnings.'
    }
}

exports.runAgentLoop = async (incidentContext, onStep) => {
    const pastLearningsText = await getPastLearnings(incidentContext.anomalyType)
    
    const conversationHistory = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `An anomaly has been detected. Incident Context: ${JSON.stringify(incidentContext)}\n\nPast Learnings for Context:\n${pastLearningsText}` }
    ]
    
    let iterations = 0
    const maxIterations = 10

    while (iterations < maxIterations) {
        iterations++
        
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: conversationHistory,
            tools: toolDefinitions,
            tool_choice: 'auto',
            parallel_tool_calls: false
        })

        const assistantMessage = response.choices[0].message
        conversationHistory.push(assistantMessage)

        const toolCalls = assistantMessage.tool_calls

        if (!toolCalls || toolCalls.length === 0) {
            return assistantMessage.content
        }

        const toolResponses = []

        for (const call of toolCalls) {
            const { id, function: { name, arguments: argsString } } = call
            const args = JSON.parse(argsString)
            const implementation = toolImplementations[name]
            let output

            if (!implementation) {
                output = { error: `Tool ${name} not found` }
                toolResponses.push({
                    role: 'tool',
                    tool_call_id: id,
                    name,
                    content: JSON.stringify(output)
                })
                
                if (onStep) {
                    await onStep(name, args, output)
                }
                continue
            }

            try {
                output = await implementation(args)
                toolResponses.push({
                    role: 'tool',
                    tool_call_id: id,
                    name,
                    content: JSON.stringify({ result: output })
                })
            } catch (error) {
                output = { error: 'Tool execution failed' + error.message }
                toolResponses.push({
                    role: 'tool',
                    tool_call_id: id,
                    name,
                    content: JSON.stringify(output)
                })
            }

            if (onStep) {
                await onStep(name, args, output)
            }
        }

        conversationHistory.push(...toolResponses)
    }

    return 'Agent loop terminated due to maximum safety iteration limit.'
}
