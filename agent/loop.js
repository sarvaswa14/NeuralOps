const { GoogleGenerativeAI } = require('@google/generative-ai')
const { toolDefinitions, toolImplementations } = require('./tools')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const systemInstruction = 'You are NeuralOps Agent, an autonomous site reliability engineer. Your job is to investigate system anomalies, diagnose root causes, and take corrective remediation actions using the tools provided. Be concise, direct, and focused on resolution. Always call read_logs and get_metrics first before forming any hypothesis. State your confidence score between 0 and 1 before taking any fix action. If confidence is below 0.75 call send_alert and stop. Never call the same tool twice with the same parameters. If a fix fails escalate immediately.'

exports.runAgentLoop = async (incidentContext) => {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        systemInstruction,
        tools: [{ functionDeclarations: toolDefinitions }]
    })

    const chat = model.startChat()
    
    let currentMessage = `An anomaly has been detected. Incident Context: ${JSON.stringify(incidentContext)}`
    let iterations = 0
    const maxIterations = 10

    while (iterations < maxIterations) {
        iterations++
        const result = await chat.sendMessage(currentMessage)
        const response = result.response
        const functionCalls = response.functionCalls

        if (!functionCalls || functionCalls.length === 0) {
            return response.text()
        }

        const toolResponses = []

        for (const call of functionCalls) {
            const { name, args } = call
            const implementation = toolImplementations[name]

            if (!implementation) {
                toolResponses.push({
                    functionResponse: {
                        name,
                        response: { error: `Tool ${name} not found` }
                    }
                })
                continue
            }

            try {
                const output = await implementation(args)
                toolResponses.push({
                    functionResponse: {
                        name,
                        response: { result: output }
                    }
                })
            } catch (error) {
                toolResponses.push({
                    functionResponse: {
                        name,
                        response: { error: 'Tool execution failed' }
                    }
                })
            }
        }

        currentMessage = toolResponses
    }

    return 'Agent loop terminated due to maximum safety iteration limit.'
}
