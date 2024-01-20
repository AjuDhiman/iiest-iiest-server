const express = require('express');
const authMiddleware = require('../middleware/auth');
const { caseList } = require('../controllers/operationControllers/caseList');

const router = express.Router();

router.get('/getcaseslist', authMiddleware, caseList);

module.exports = router;


