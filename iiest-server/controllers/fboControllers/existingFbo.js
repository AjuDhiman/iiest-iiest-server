const { ObjectId } = require("mongodb");
const { empSignBucket, createInvoiceBucket } = require("../../config/buckets");
const invoiceDataHandler = require("../../fbo/generateInvoice");
const areaAllocationModel = require("../../models/employeeAreaSchema");
const salesModel = require("../../models/employeeSalesSchema");
const employeeSchema = require("../../models/employeeSchema");
const fboModel = require('../../models/fboSchema');

exports.existingFboCash = async(req, res)=>{
    try {

      const createrObjId = req.params.id;

      let success = false;

      const userInfo = await employeeSchema.findById(createrObjId);
      const signatureFile = userInfo.signatureImage;

      if(!signatureFile){
        return res.status(404).json({success, signatureErr: true})
      }

      const areaAlloted = await areaAllocationModel.findOne({employeeInfo: createrObjId});
      if(!areaAlloted){
        success = false;
        return res.status(404).json({success, areaAllocationErr: true})
      }

      const signatureBucket = empSignBucket();

      const signExists = await signatureBucket.find({"_id": new ObjectId(signatureFile)}).toArray();

      if(!signExists.length > 0){
        return res.status(404).json({success, noSignErr: true})
      }

      const { product_name, payment_mode, grand_total, pincode, fostac_training, foscos_training, fostacGST, foscosGST, foscosFixedCharge, existingFboId } = req.body;

      const existingFboInfo = await fboModel.findOne({customer_id: existingFboId});

      if(!existingFboInfo){
        success = false;
        return res.status(404).json({success, fboMissing: true});
      }

      const pincodeCheck = areaAlloted.pincodes.includes(pincode);

      if(!pincodeCheck){
      success = false;
      return res.status(404).json({success, wrongPincode: true});
      }

      let serviceArr = [];

      if(fostac_training){
        serviceArr.push(fostac_training.fostac_service_name)
      }

      if(foscos_training){
        serviceArr.push(foscos_training.foscos_service_name)
      }

      let total_processing_amount = 0;
      let totalGST = 0;
      let waterTestFee = 0;
      let extraFee = 0;

      if(product_name.includes('Fostac Training')){
        total_processing_amount += Number(fostac_training.fostac_processing_amount);
        totalGST += fostacGST
      }

      if(product_name.includes('Foscos Training')){
        total_processing_amount += Number(foscos_training.foscos_processing_amount);
        totalGST += foscosGST;
        extraFee += foscosFixedCharge
        if(foscos_training.water_test_fee !== null){
          waterTestFee += Number(foscos_training.water_test_fee)
        }
      }

      const invoiceBucket = createInvoiceBucket();

      const fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;

      const invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      const selectedProductInfo = await salesModel.create({employeeInfo: createrObjId, fboInfo: existingFboInfo._id, product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, payment_mode, grand_total, invoiceId: invoiceUploadStream.id});

      if(!selectedProductInfo){
        success = false;
        return res.status(401).json({ success, randomErr: true })
      }

      await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, total_processing_amount, extraFee, totalGST, grand_total, serviceArr, waterTestFee, signatureFile, invoiceUploadStream);
      success = true;
      return res.status(200).json({ success })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}


exports.existingFboPayReturn = async(req,res)=>{
    try {
        
        let success = false;

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

exports.existingFboPayment = async(req, res)=>{
    try {
        
        let success = false;

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}