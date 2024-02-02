const express = require('express');
const authMiddleware = require('../middleware/auth');
const { caseList, caseInfo, employeeCountDeptWise } = require('../controllers/operationControllers/caseList');
const { fostacVerification, getFostacVerifiedData, fostacEnrollment, getFostacEnrolledData, postGenOperData, getGenOperData, updateGenOperData } = require('../controllers/operationControllers/formSections');
const { getAuditLogs } = require('../controllers/generalControllers/auditLogsControllers');

const router = express.Router();

router.get('/getcaseslist', authMiddleware, caseList);
router.get('/morecaseinfo/:recipientid', authMiddleware, caseInfo);
router.get('/employeelistdeptwise/:dept',authMiddleware, employeeCountDeptWise);
router.post('/fostacverification/:recipientid', authMiddleware, fostacVerification);
router.get('/getfostacverifieddata/:recipientid', authMiddleware, getFostacVerifiedData); // route for getting if a person is verifed or not if verified then getting it's data
router.post('/fostacenrollment/:verifieddataid', authMiddleware, fostacEnrollment);
router.get('/getfostacenrolleddata/:verifieddataid', authMiddleware, getFostacEnrolledData); // route for getting if a person is enrolled or not if enrolled then getting it's data
router.post('/postopergendata/:recipientid', authMiddleware, postGenOperData);//route for adding data in genral section of operation form
router.get('/getopergensecdata/:recipientid', authMiddleware, getGenOperData); // route for getting if a person general sec data in operation form
router.put('/updateopergensecdata/:recipientid', authMiddleware, updateGenOperData); // route for updating person's general sec data in operation form
router.get('/getauditlogs/:recipientid', authMiddleware, getAuditLogs); // route for getting audit logs history of a particular recipient
module.exports = router;