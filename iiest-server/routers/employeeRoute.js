const express = require('express');
const { employeeFormValidation, employeeLoginValidation } = require('../validation/employeeValidation');
const { employeeRegister, employeeLogin, allEmployeesData, deleteEmployee, editEmployee } = require('../controllers/employee');
const { employeeFormData } = require('../controllers/generalData');
const { employeeRecord } = require('../controllers/employeeRecord');
const authMiddleware = require('../middleware/auth');
const multer = require('multer')

const router = express.Router();
const signatureStorage = multer.memoryStorage();
const signatureUpload = multer({storage: signatureStorage})

router.post('/empregister', authMiddleware, employeeFormValidation, signatureUpload.single('signature'), employeeRegister); //Router for staff registration
router.post('/login', employeeLoginValidation, employeeLogin); //Router for staff login
router.delete('/deleteEmployee/:id', authMiddleware, deleteEmployee); //Router for deleting  employee
router.put('/editEmployee/:id', authMiddleware, editEmployee); //Router for editing employee data
router.get('/empgeneraldata', authMiddleware, employeeFormData); //Router for general employee form data
router.get('/allemployees', authMiddleware, allEmployeesData); //Router for all employees data
router.get('/employeeRecord', authMiddleware, employeeRecord);



module.exports = router;