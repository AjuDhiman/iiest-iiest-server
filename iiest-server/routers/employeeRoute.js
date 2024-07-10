const express = require('express');
const { employeeRegister, employeeLogin,forgotPassword, resetPassword, allEmployeesData, deleteEmployee, editEmployee, areaAllocation, allocatedAreas, employeeImage, employeeSignature, editEmployeeImages, assignManger } = require('../controllers/employeeControllers/employee');
const { employeeFormData, getPostData, getPincodesData } = require('../controllers/generalControllers/generalData');
const { employeeRecord, employeeSalesData, employeeDepartmentCount, empSalesProdWise, empHiringData, getEmployeeUnderManager, salesData, ticketVerificationData} = require('../controllers/employeeControllers/employeeRecord');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { getTopSalesPersons, getTopProducts, getEmpUnderManager, mostRepeatedCustomer } = require('../controllers/employeeControllers/statList');
const { getProductSaleData, getAreaWiseSalesData, getPersonWiseSalesData, getClientTypeSalesData, getMonthWiseSaleData, getAreaWiseFboData, getRepeactCustomerData, getData, ticketDeviveryChartData } = require('../controllers/employeeControllers/Highcharts');
const { getEmployeeNameAndId, verifyEmail } = require('../controllers/boControllers/bo');

const router = express.Router();
const employeeFilesStorage = multer.memoryStorage();
const employeeFilesUpload = multer({storage: employeeFilesStorage});





//-----------------------------------------------routes--------------------------------------------------------------------------------------

router.post('/empregister', authMiddleware, employeeFilesUpload.fields([{name: 'empSignature', maxCount: 1}, {name: 'employeeImage', maxCount: 1}]), employeeRegister); //Route of regitering new employee
router.post('/login', employeeLogin);// Route for calling login API for a particular employee
router.post('/forgot-password', forgotPassword);  //route for calling forgot password api
router.post('/reset-password', resetPassword); //route for calling reset password API
router.delete('/deleteEmployee/:id', authMiddleware, deleteEmployee); //route for deleting employee record from db
router.put('/editEmployee/:id', authMiddleware, editEmployee); //route for editing employee info
router.get('/empgeneraldata', authMiddleware, employeeFormData); //route for getting general staff data from db like heirarcchy of panel
router.get('/allemployees', authMiddleware, allEmployeesData); //route for getting data of all employees
router.get('/getpostdata', authMiddleware, getPostData);  //route for getting getting department and designation heirarchy
router.get('/employeeRecord', authMiddleware, employeeRecord); //route for getting sale data in particular time interval for a sales person used  for stat cards
router.get('/ticketverificationdata', authMiddleware, ticketVerificationData); //data of verofication of tickets for statcards
router.get('/getPincodesData/:stateName', authMiddleware, getPincodesData); //getting data of all pincode for a particular state geeting data from pincode.json file
router.get('/employeesaleslist', authMiddleware, employeeSalesData); //route for getting all sale list related to a user or all in case of director or verifer
router.post('/registerarea/:id', authMiddleware, areaAllocation); //route for alocating area to a employee
router.post('/assignmanager/:id', authMiddleware, assignManger); //rote for assigning manager
router.get('/allocatedareas/:id', authMiddleware, allocatedAreas); //route for getting allocated area of a particular employee
router.get('/getuserimage/:id', authMiddleware, employeeImage); //route for getting employee image file from bucket
router.get('/getusersign/:id', authMiddleware, employeeSignature); //route for getting employee signature file from bucket
router.post('/edituserfiles', authMiddleware, employeeFilesUpload.fields([{name: 'userImage', maxCount: 1}, {name: 'userSign', maxCount: 1}]), editEmployeeImages); //route for updating employee image or sinature
router.get('/empcountbydept', authMiddleware, employeeDepartmentCount); //route for getting department and its employee count data
router.get('/getemphiringdata', authMiddleware, empHiringData); //route for getting hiring data of a particular employee
router.get('/getemployeeundermanager', authMiddleware, getEmployeeUnderManager); //route for gettig employee list under manager




// ---------------------------------------------------------routes for Highcharts APIs ----------------------------------------------------------
router.get('/getproductsaledata',authMiddleware, getProductSaleData); //route for getting data for productwise chart
router.get('/getareawisesaledata', authMiddleware, getAreaWiseSalesData); //route for getting data for Area Wise chart
router.get('/getpersonwisesaledata', authMiddleware, getPersonWiseSalesData); //route for getting data for Sales Person chart
router.get('/getclienttypesaledata', authMiddleware , getClientTypeSalesData); //route for getting data for Client Wise chart
router.get('/getmothwisesale', authMiddleware, getMonthWiseSaleData); //route for getting data for Month Wise or time interval wise chart
router.get('/getrepeatedcustdata',authMiddleware, getRepeactCustomerData); //route for getting data for customer repetition chart
router.get('/getticketdeliverychartdata', authMiddleware, ticketDeviveryChartData); //route for getting data for ticket delivery chart




//----------------------------------------------------------routes for Statlist APIs-------------------------------------------------------------
router.get('/gettopsalespersons', authMiddleware, getTopSalesPersons);//route for getting to sales person list
router.get('/gettopproducts', authMiddleware, getTopProducts);//route for getting to to product list
router.get('/getempundermanager', authMiddleware, getEmpUnderManager); //route for getting to sales of employee under a manager
router.get('/getmostrepeatedcust', authMiddleware, mostRepeatedCustomer); //route for getting to most repeted customer list




router.post('/verifymail/:id', verifyEmail);//route for verifing mail
router.get('/getempnamelist', getEmployeeNameAndId); //route for getting employee name and id list for onboard form

module.exports = router;