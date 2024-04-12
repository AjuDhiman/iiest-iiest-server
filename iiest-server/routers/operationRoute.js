const express = require('express');
const authMiddleware = require('../middleware/auth');
const { caseList, caseInfo, employeeCountDeptWise } = require('../controllers/operationControllers/caseList');
const { fostacVerification, getFostacVerifiedData, fostacEnrollment, getFostacEnrolledData, postGenOperData, getGenOperData, updateGenOperData, fostacAttendance, getFostacAttenData, ticketDelivery, getTicketDeliveryData, foscosVerification, hraVerification, getFoscosVerifiedData, fssaiRevert, getReverts, foscosFiling, getHraVerifiedData, getFoscosFiledData } = require('../controllers/operationControllers/formSections');
const { getAuditLogs } = require('../controllers/generalControllers/auditLogsControllers');
const { getKobData } = require('../controllers/generalControllers/generalData');
const { fostacDocuments, foscosDocuments, hraDocuments } = require('../config/storage');
const { trainingBatch, getTrainingBatchData, updateBatch, auditBatch } = require('../controllers/trainingControllers/trainingBatch');
const { saveDocument, getDocList, deleteDocs } = require('../controllers/operationControllers/documents');

const router = express.Router();

router.get('/getcaseslist', authMiddleware, caseList);
router.get('/morecaseinfo/:recipientid', authMiddleware, caseInfo);
router.get('/employeelistdeptwise/:dept',authMiddleware, employeeCountDeptWise);
router.post('/fostacverification/:recipientid', authMiddleware, fostacVerification, trainingBatch);
router.post('/foscosverification/:shopid', authMiddleware, foscosVerification);
router.post('/hraverification/:shopid', authMiddleware, hraVerification, auditBatch);
router.get('/getkobdata', authMiddleware, getKobData); // route for getting kob heirarchy from general datas in case of foscos
router.get('/getfostacverifieddata/:recipientid', authMiddleware, getFostacVerifiedData); // route for getting if a person is verifed or not if verified then getting it's data
router.get('/getfoscosverifieddata/:shopid',authMiddleware, getFoscosVerifiedData);
router.get('/gethraverifieddata/:shopid',authMiddleware, getHraVerifiedData);
router.post('/fostacenrollment/:verifieddataid', authMiddleware, fostacEnrollment);
router.get('/getfostacenrolleddata/:verifieddataid', authMiddleware, getFostacEnrolledData); // route for getting if a person is enrolled or not if enrolled then getting it's data
router.post('/foscosfilling/:verifieddataid', authMiddleware, hraDocuments.fields([{name: 'payment_receipt', maxCount: 50}]) , foscosFiling); // route for filing the case for a foscos license
router.get('/getfoscosfileddata/:verifieddataid', authMiddleware, getFoscosFiledData);
router.post('/postopergendata/:recipientid', authMiddleware, postGenOperData);//route for adding data in genral section of operation form
router.post('/registerrevert/:id', authMiddleware, fssaiRevert);//route for adding data in genral section of operation form
router.get('/getopergensecdata/:recipientid', authMiddleware, getGenOperData); // route for getting if a person general sec data in operation form
router.get('/getauditlogs/:recipientid', authMiddleware, getAuditLogs); // route for getting audit logs history of a particular recipient
module.exports = router;
router.get('/getreverts/:id', authMiddleware, getReverts); // route for getting Fssai reverts history of a particular shop
module.exports = router;
router.post('/closeticket/:recipientid', authMiddleware,fostacDocuments.single('certificate'), ticketDelivery);
router.get('/getticketdeliverydata/:recipientid', authMiddleware, getTicketDeliveryData)// route for getting ticket delivery data for a customer
router.post('/savefoscosdocuments/:id', authMiddleware,  foscosDocuments.fields([{name: 'document', maxCount: 50}]), saveDocument)// route for saving docs for a shop
router.post('/savehradocuments/:id', authMiddleware,  hraDocuments.fields([{name: 'document', maxCount: 50}]), saveDocument)// route for saving docs for a shop
router.delete('/deletedoc/:id', authMiddleware, deleteDocs)// route for saving docs for a shop
router.get('/getdocs/:id', authMiddleware, getDocList);

//routes for trainer
router.post('/fostacattendance/:enrolleddataid', authMiddleware, fostacAttendance)
router.get('/getfostacattendata/:enrolleddataid', authMiddleware, getFostacAttenData); 
router.get('/getbatchlistdata', authMiddleware, getTrainingBatchData) // route for getting batch list data
router.put('/updatetraingbatch/:batchid', authMiddleware, updateBatch) // route for updating batch list data