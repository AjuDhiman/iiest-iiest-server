const express = require('express');
const { employeeRegister, employeeLogin, allEmployeesData, deleteEmployee, editEmployee } = require('../controllers/employee');
const { employeeFormData, getPostData } = require('../controllers/generalData');
const { employeeRecord } = require('../controllers/employeeRecord');
const authMiddleware = require('../middleware/auth');
const multer = require('multer')

const router = express.Router();
const employeeFilesStorage = multer.memoryStorage();
const employeeFIlesUpload = multer({storage: employeeFilesStorage})

router.post('/empregister', authMiddleware, employeeFIlesUpload.fields([{name: 'empSignature', maxCount: 1}, {name: 'employeeImage', maxCount: 1}]), employeeRegister);
router.post('/login', employeeLogin);
router.delete('/deleteEmployee/:id', authMiddleware, deleteEmployee);
router.put('/editEmployee/:id', authMiddleware, editEmployee);
router.get('/empgeneraldata', authMiddleware, employeeFormData);
router.get('/allemployees', authMiddleware, allEmployeesData);
router.get('/getpostdata', authMiddleware, getPostData); 
router.get('/employeeRecord', authMiddleware, employeeRecord);



module.exports = router;