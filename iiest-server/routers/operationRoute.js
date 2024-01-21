const express = require('express');
const authMiddleware = require('../middleware/auth');
const { caseList, caseInfo } = require('../controllers/operationControllers/caseList');

const router = express.Router();

router.get('/getcaseslist', authMiddleware, caseList);
router.get('/morecaseinfo/:id', authMiddleware, caseInfo);

module.exports = router;


