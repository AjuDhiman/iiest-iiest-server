const salesModel = require('../models/employeeModels/employeeSalesSchema');
const fboModel = require('../models/fboModels/fboSchema');
const { recipientModel, shopModel, hygieneShopModel } = require('../models/fboModels/recipientSchema');
const boModel = require('../models/BoModels/boSchema')

let generateCustomerId = (randonNum)=>{
    let customerId = '';
    customerId = `IIEST/${randonNum}`;
    return customerId
}

let generateMemberId = (randonNum)=>{
  let customerId = '';
  customerId = `IIEST/MB/${randonNum}`;
  return customerId
}

const generateUniqueId = async() => {
  let isUnique = false;
  let idNumber;

  while(!isUnique) {
    idNumber = Math.floor(100000 + Math.random() * 900000) - 1;
    const existingNumber = await boModel.findOne({id_num: idNumber});
    if(!existingNumber) {
      isUnique = true;
    }
  }

  const generatedUniqueCustomerId = generateMemberId(idNumber);
  return {idNumber, generatedUniqueCustomerId}
}

const generatedInfo = async()=>{
    let isUnique = false;
    let idNumber;

    while (!isUnique) {
      idNumber = Math.floor(10000 + Math.random() * 900000) - 1;
      const existingNumber = await fboModel.findOne({ id_num: idNumber });
      if (!existingNumber) {
        isUnique = true;
      }
    }

    const generatedCustomerId = generateCustomerId(idNumber);

    return { idNumber, generatedCustomerId}
}

const generateRecipientInfo = async(salesId) => {
    let isUnique = false;
    let idNumber;

    while(!isUnique){
      idNumber = Math.floor(10000 + Math.random() * 9000);
      const existingNumber = await recipientModel.findOne({id_num : idNumber});
      if(!existingNumber){
        isUnique = true;
      }
    }

    let recipientId = await getRecipientId(salesId, idNumber);

    return {idNumber, recipientId};
}

const getRecipientId = async(salesId, idNumber) => {
    let recipientId = '';

    const empSales = await salesModel.findOne({_id: salesId}).populate({path: 'fboInfo'});
    
    recipientId = `${empSales.fboInfo.customer_id}/REC/${idNumber}`
    
    return recipientId;
}

const generateHygieneShopInfo = async(salesId) => {
  let isUnique = false;
  let idNumber;

  while(!isUnique){
    idNumber = Math.floor(10000 + Math.random() * 9000);
    const existingNumber = await hygieneShopModel.findOne({id_num : idNumber});
    if(!existingNumber){
      isUnique = true;
    }
  }

  let shopId = await getHygieneShopId(salesId, idNumber);

  return {idNumber, shopId};
}

const getHygieneShopId = async(salesId, idNumber) => {
  let shopId = '';

  const empSales = await salesModel.findOne({_id: salesId}).populate({path: 'fboInfo'});
  
  shopId = `${empSales.fboInfo.customer_id}/SP/${idNumber}`
  
  return shopId;
}

module.exports = {generateUniqueId, generatedInfo, generateRecipientInfo, generateHygieneShopInfo};