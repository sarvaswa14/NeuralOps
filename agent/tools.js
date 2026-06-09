const LogEntry = require('../backend/models/logEntry')
const MetricSnapshot = require('../backend/models/metricSnapshot')
const Deployment = require('../backend/models/deployment')
const mongoose = require('mongoose')

const toolDefinitions = [
    {
        type: 'function',
        function: {
            name: 'read_logs',
            description: 'fetches recent log entries from MongoDB for a service filtered by time and level. call this first when investigating any anomaly',
            parameters: {
                type: 'object',
                properties: {
                    service: { type: 'string', description: 'the service name to get logs from' },
                    limit: { type: 'number', description: 'maximum number of log lines to return' },
                    startTime: { type: 'string', description: 'ISO timestamp to filter logs from a specific starting time' }
                },
                required: ['service']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_metrics',
            description: 'gets performance metrics like cpu memory or error rates for a service. use this to check system health and find resource spikes',
            parameters: {
                type: 'object',
                properties: {
                    target: { type: 'string', description: 'the service identifier to collect metrics for' },
                    durationMinutes: { type: 'number', description: 'how many minutes back to retrieve data for' }
                },
                required: ['target']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'check_deployments',
            description: 'checks recent application deployment history and build status. use this to see if a recent update caused an incident',
            parameters: {
                type: 'object',
                properties: {
                    service: { type: 'string', description: 'the service name to filter history' },
                    limit: { type: 'number', description: 'number of past deployments to list' }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'query_database',
            description: 'runs a safe read query on the database collections. use this to verify application state configuration or record flags',
            parameters: {
                type: 'object',
                properties: {
                    collection: { type: 'string', description: 'the database collection name to look at' },
                    filter: { type: 'object', description: 'the query criteria object for the lookup' }
                },
                required: ['collection', 'filter']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'restart_service',
            description: 'restarts a specific service container immediately. use this to clear stuck loops memory leaks or locked processes',
            parameters: {
                type: 'object',
                properties: {
                    service: { type: 'string', description: 'the name of the service to restart' }
                },
                required: ['service']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'rollback_deployment',
            description: 'reverts the active system to the last known healthy deployment version. use this when a new change causes an active outage',
            parameters: {
                type: 'object',
                properties: {
                    deploymentId: { type: 'string', description: 'the unique id of the deployment to roll back' }
                },
                required: ['deploymentId']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'scale_service',
            description: 'changes the number of running instances for a service. use this to handle high traffic surges or clear processing queues',
            parameters: {
                type: 'object',
                properties: {
                    service: { type: 'string', description: 'the name of the service to scale' },
                    replicas: { type: 'number', description: 'the target number of container instances to run' }
                },
                required: ['service', 'replicas']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'send_alert',
            description: 'sends an emergency notification to oncall channels. use this when automated steps fail to resolve a critical issue',
            parameters: {
                type: 'object',
                properties: {
                    severity: { type: 'string', description: 'the urgency level like critical warning or info' },
                    message: { type: 'string', description: 'text details explaining the alert reason' }
                },
                required: ['severity', 'message']
            }
        }
    }
]

const toolImplementations = {
    read_logs: async ({ service, limit = 100, startTime }) => {
    const query = { service }
    if (startTime) {
        const parsedTime = new Date(startTime)
        if (!isNaN(parsedTime.getTime())) {
            query.timestamp = { $gte: parsedTime }
        }
    }
    return await LogEntry.find(query).sort({ timestamp: -1 }).limit(limit)
},

    get_metrics: async ({ target, durationMinutes = 15 }) => {
        const query = { service: target }
        const cutoff = new Date(Date.now() - durationMinutes * 60 * 1000)
        query.timestamp = { $gte: cutoff }
        
        return await MetricSnapshot.find(query).sort({ timestamp: -1 })
    },

    check_deployments: async ({ service, limit = 10 }) => {
        const query = service ? { service } : {}
        return await Deployment.find(query).sort({ deployedAt: -1 }).limit(limit)
    },

    query_database: async ({ collection, filter }) => {
        const db = mongoose.connection.db
        return await db.collection(collection).find(filter).toArray()
    },

    restart_service: async ({ service }) => {
        const response = await fetch('http://localhost:4000/admin/heal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service })
        })
        return { success: response.ok, status: response.status }
    },

    rollback_deployment: async ({ deploymentId }) => {
        const deployment = await Deployment.findByIdAndUpdate(
            deploymentId,
            { status: 'rolled_back' },
            { new: true }
        )
        return deployment
    },

    scale_service: async ({ service, replicas }) => {
        return { message: `successfully scaled ${service} to ${replicas} replicas` }
    },

    send_alert: async ({ severity, message }) => {
        const alertLog = await LogEntry.create({
            service: 'agent_alert_system',
            level: 'fatal',
            message: `[${severity.toUpperCase()}] ${message}`,
            timestamp: new Date()
        })
        return alertLog
    }
}

module.exports = {
    toolDefinitions,
    toolImplementations
}
