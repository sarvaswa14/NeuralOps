exports.generatePostMortem = (incident, steps) => {
    const createdAt = incident.createdAt ? new Date(incident.createdAt) : null
    const resolvedAt = incident.resolvedAt ? new Date(incident.resolvedAt) : null
    const timeToResolve = (createdAt && resolvedAt) ? Math.floor((resolvedAt - createdAt) / 1000) : 0

    const toolNames = steps
        .filter(step => step.toolName)
        .map(step => step.toolName)
    const toolsCalled = [...new Set(toolNames)]

    let confidenceAtDecision = 0
    if (incident.actionTaken) {
        const decisionStep = steps.find(step => step.action === incident.actionTaken || step.toolName === incident.actionTaken)
        if (decisionStep && decisionStep.confidence) {
            confidenceAtDecision = decisionStep.confidence
        }
    }

    return {
        summary: `Incident ${incident.anomalyType || 'anomaly'} resolved with action ${incident.actionTaken || 'none'}.`,
        anomalyType: incident.anomalyType || 'unknown',
        anomalyScore: incident.anomalyScore || 0,
        stepsCount: steps.length,
        toolsCalled,
        actionTaken: incident.actionTaken || 'none',
        actionResult: incident.actionResult || 'none',
        timeToResolve,
        confidenceAtDecision,
        generatedAt: new Date()
    }
}
