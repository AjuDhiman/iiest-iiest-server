const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getTrainingBatchData } = require('../controllers/trainingControllers/trainingBatch');


const router = express.Router();

router.get('/gettrainingbatchdata', authMiddleware, getTrainingBatchData)

//eporting router
module.exports = router;