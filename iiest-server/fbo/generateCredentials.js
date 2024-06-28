const salesModel = require('../models/employeeModels/employeeSalesSchema');
const fboModel = require('../models/fboModels/fboSchema');
const { recipientModel, shopModel, hygieneShopModel } = require('../models/fboModels/recipientSchema');
const boModel = require('../models/BoModels/boSchema')

let generateCustomerId = (randonNum)=>{ //methord for generating customer id for fbo or shopb by the help of random num
    let customerId = '';
    customerId = `IIEST/SP/${randonNum}`;
    return customerId
}

let generateMemberId = (randonNum)=>{//methord for generating customer id for bo or member by the help of random num
  let customerId = '';
  customerId = `IIEST/MB/${randonNum}`;
  return customerId
}

const generateUniqueId = async() => { //generating unique id num bo or member for creating unique bo id
  let isUnique = false; //initialing unique as false
  let idNumber;

  while(!isUnique) { // loop will continue in case unique id num is not found
    idNumber = Math.floor(100000 + Math.random() * 900000) - 1;
    const existingNumber = await boModel.findOne({id_num: idNumber});
    if(!existingNumber) {
      isUnique = true; 
    }
  }

  const generatedUniqueCustomerId = generateMemberId(idNumber);
  return {idNumber, generatedUniqueCustomerId}
}

const generatedInfo = async()=>{  //generating unique id num shop  for creating unique shop id
    let isUnique = false;
    let idNumber;

    while (!isUnique) { // loop will continue in case unique id num is not found
      idNumber = Math.floor(10000 + Math.random() * 900000) - 1;
      const existingNumber = await fboModel.findOne({ id_num: idNumber });
      if (!existingNumber) {
        isUnique = true;
      }
    }

    const generatedCustomerId = generateCustomerId(idNumber);

    return { idNumber, generatedCustomerId}
}

const generateRecipientInfo = async(salesId) => {  //generating unique id num recipient for creating unique recipient id
    let isUnique = false;
    let idNumber;

    while(!isUnique){ // loop will continue in case unique id num is not found
      idNumber = Math.floor(10000 + Math.random() * 9000);
      const existingNumber = await recipientModel.findOne({id_num : idNumber});
      if(!existingNumber){
        isUnique = true;
      }
    }

    let recipientId = await getRecipientId(salesId, idNumber);

    return {idNumber, recipientId};
}

const getRecipientId = async(salesId, idNumber) => {  //methord for generating customer id for recipient by the help of random num
    let recipientId = '';

    const empSales = await salesModel.findOne({_id: salesId}).populate({path: 'fboInfo'});
    
    recipientId = `${empSales.fboInfo.customer_id}/REC/${idNumber}` //genearing recipint id with refrence to fbo id
    
    return recipientId;
}

module.exports = {generateUniqueId, generatedInfo, generateRecipientInfo};