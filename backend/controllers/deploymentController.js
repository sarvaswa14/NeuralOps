const Deployment = require('../models/deployment')
exports.getAllDeployments = async (req, res) => {
    try {
        const deployments = await Deployment.find().sort({ createdAt: -1 })
        return res.status(200).json(deployments)
    } catch (error) {
        return res.status(500).json()
    }
}
exports.createDeployment = async (req, res) => {
    try {
        const deployment = await Deployment.create(req.body)
        return res.status(201).json(deployment)
    } catch (error) {
        return res.status(500).json()
    }
}
exports.rollbackDeployment = async (req, res) => {
    try {
        const deployment = await Deployment.findByIdAndUpdate(
            req.params.id,
            { status: 'rolled_back' },
            { new: true, runValidators: true }
        )
        if (!deployment) {
            return res.status(404).json({ message: 'Deployment not found' })
        }
        return res.status(200).json(deployment)
    } catch (error) {
        return res.status(500).json()
    }
}