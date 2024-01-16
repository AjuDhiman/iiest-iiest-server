const express = require('express');
const { employeeRegister, employeeLogin, allEmployeesData, deleteEmployee, editEmployee, areaAllocation, allocatedAreas } = require('../controllers/employee');
const { employeeFormData, getPostData, getPincodesData } = require('../controllers/generalData');
const { employeeRecord, employeeSalesData } = require('../controllers/employeeRecord');
const authMiddleware = require('../middleware/auth');
const multer = require('multer')

const router = express.Router();
const employeeFilesStorage = multer.memoryStorage();
const employeeFilesUpload = multer({storage: employeeFilesStorage})

router.post('/empregister', authMiddleware, employeeFilesUpload.fields([{name: 'empSignature', maxCount: 1}, {name: 'employeeImage', maxCount: 1}]), employeeRegister);
router.post('/login', employeeLogin);
router.delete('/deleteEmployee/:id', authMiddleware, deleteEmployee);
router.put('/editEmployee/:id', authMiddleware, editEmployee);
router.get('/empgeneraldata', authMiddleware, employeeFormData);
router.get('/allemployees', authMiddleware, allEmployeesData);
router.get('/getpostdata', authMiddleware, getPostData); 
router.get('/employeeRecord', authMiddleware, employeeRecord);
router.get('/getPincodesData/:stateName', authMiddleware, getPincodesData);
router.get('/employeesaleslist', authMiddleware, employeeSalesData);
router.post('/registerarea/:id', authMiddleware, areaAllocation);
router.get('/allocatedareas/:id', authMiddleware, allocatedAreas)

module.exports = router;