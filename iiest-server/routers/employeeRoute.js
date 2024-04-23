const express = require('express');
const { employeeRegister, employeeLogin,forgotPassword, resetPassword, allEmployeesData, deleteEmployee, editEmployee, areaAllocation, allocatedAreas, employeeImage, employeeSignature, editEmployeeImages, assignManger } = require('../controllers/employeeControllers/employee');
const { employeeFormData, getPostData, getPincodesData } = require('../controllers/generalControllers/generalData');
const { employeeRecord, employeeSalesData, employeeDepartmentCount, empSalesProdWise, empHiringData, getEmployeeUnderManager, salesData} = require('../controllers/employeeControllers/employeeRecord');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { getTopSalesPersons, getTopProducts, getEmpUnderManager, mostRepeatedCustomer } = require('../controllers/employeeControllers/statList');
const { getProductSaleData, getAreaWiseSalesData, getPersonWiseSalesData, getClientTypeSalesData, getMonthWiseSaleData, getAreaWiseFboData, getRepeactCustomerData, getData } = require('../controllers/employeeControllers/Highcharts');

const router = express.Router();
const employeeFilesStorage = multer.memoryStorage();
const employeeFilesUpload = multer({storage: employeeFilesStorage});

router.post('/empregister', authMiddleware, employeeFilesUpload.fields([{name: 'empSignature', maxCount: 1}, {name: 'employeeImage', maxCount: 1}]), employeeRegister);
router.post('/login', employeeLogin);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPassword);
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
router.get('/getemphiringdata', authMiddleware, empHiringData);
router.get('/getemployeeundermanager', authMiddleware, getEmployeeUnderManager);
router.get('/getproductsaledata',authMiddleware, getProductSaleData);
router.get('/getareawisesaledata', authMiddleware, getAreaWiseSalesData);
router.get('/getpersonwisesaledata', authMiddleware, getPersonWiseSalesData);
router.get('/getclienttypesaledata', authMiddleware , getClientTypeSalesData);
router.get('/getmothwisesale', authMiddleware, getMonthWiseSaleData);
router.get('/gettopsalespersons', authMiddleware, getTopSalesPersons);
router.get('/getmostrepeatedcust', mostRepeatedCustomer);
router.get('/getrepeatedcustdata',authMiddleware, getRepeactCustomerData);
router.get('/gettopproducts', authMiddleware, getTopProducts);
router.get('/getempundermanager', authMiddleware, getEmpUnderManager);
router.get('/getdata', getData);
// router.get('/getsalesdata', salesData); // api in development for getting optimized sales list

module.exports = router;