const express = require('express')
const router = express.Router()
const deploymentController = require('../controllers/deploymentController')
const protect = require('../middleware/protect')
router.use(protect)
router.route('/').get(deploymentController.getAllDeployments).post(deploymentController.createDeployment)
router.route('/:id/rollback').post(deploymentController.rollbackDeployment)

module.exports = router
