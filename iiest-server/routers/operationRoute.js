const express = require('express');
const authMiddleware = require('../middleware/auth');
const { caseList, caseInfo, employeeCountDeptWise } = require('../controllers/operationControllers/caseList');
const { fostacVerification } = require('../controllers/operationControllers/formSections');

const router = express.Router();

router.get('/getcaseslist', authMiddleware, caseList);
router.get('/morecaseinfo/:recipientid', authMiddleware, caseInfo);
router.get('/employeelistdeptwise/:dept',authMiddleware, employeeCountDeptWise);
router.post('/fostacverification/:recipientid', authMiddleware, fostacVerification)

module.exports = router;


