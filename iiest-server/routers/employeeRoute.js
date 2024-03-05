const express = require('express');
const { employeeRegister, employeeLogin, allEmployeesData, deleteEmployee, editEmployee, areaAllocation, allocatedAreas, employeeImage, employeeSignature, editEmployeeImages, assignManger } = require('../controllers/employeeControllers/employee');
const { employeeFormData, getPostData, getPincodesData } = require('../controllers/generalControllers/generalData');
const { employeeRecord, employeeSalesData, employeeDepartmentCount, empSalesProdWise, empHiringData, getEmployeeUnderManager, getProductSaleData, getAreaWiseSalesData, getPersonWiseSalesData, getClientTypeSalesData, getMonthWiseSaleData, func } = require('../controllers/employeeControllers/employeeRecord');
const authMiddleware = require('../middleware/auth');
const multer = require('multer')

const router = express.Router();
const employeeFilesStorage = multer.memoryStorage();
const employeeFilesUpload = multer({storage: employeeFilesStorage});

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
router.post('/assignmanager/:id', authMiddleware, assignManger);
router.get('/allocatedareas/:id', authMiddleware, allocatedAreas);
router.get('/getuserimage/:id', authMiddleware, employeeImage);
router.get('/getusersign/:id', authMiddleware, employeeSignature);
router.post('/edituserfiles', authMiddleware, employeeFilesUpload.fields([{name: 'userImage', maxCount: 1}, {name: 'userSign', maxCount: 1}]), editEmployeeImages);
router.get('/empcountbydept', authMiddleware, employeeDepartmentCount);
router.get('/getempsalesprodwise', authMiddleware, empSalesProdWise);
router.get('/getemphiringdata', authMiddleware, empHiringData);
router.get('/getemployeeundermanager', authMiddleware, getEmployeeUnderManager);
router.get('/getproductsaledata',authMiddleware, getProductSaleData);
router.get('/getareawisesaledata', authMiddleware, getAreaWiseSalesData);
router.get('/getpersonwisesaledata', authMiddleware, getPersonWiseSalesData);
router.get('/getclienttypesaledata', authMiddleware, getClientTypeSalesData);
router.get('/getmothwisesale', authMiddleware, getMonthWiseSaleData);

module.exports = router;