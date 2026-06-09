exports.parseConfidence = (text) => {
    if (!text) {
        return { confidence: 0, shouldAct: false }
    }

    const match = text.match(/confidence.*?(0\.\d+|1\.0|[01])/i)
    
    if (match) {
        const confidence = parseFloat(match[1])
        return {
            confidence,
            shouldAct: confidence >= 0.75
        }
    }

    return { confidence: 0, shouldAct: false }
}
