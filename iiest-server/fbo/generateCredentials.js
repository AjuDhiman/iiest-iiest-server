const salesModel = require('../models/employeeModels/employeeSalesSchema');
const fboModel = require('../models/fboModels/fboSchema');
const { recipientModel } = require('../models/fboModels/recipientSchema');

const generateCustomerId = (randonNum)=>{
    let customerId = '';
    customerId = `IIEST/${randonNum}`;
    return customerId
}

const generatedInfo = async()=>{
    let isUnique = false;
    let idNumber;

    while (!isUnique) {
      idNumber = Math.floor(10000 + Math.random() * 90000);
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
    
    recipientId = `${empSales.fboInfo.customer_id}/${idNumber}`
    
    return recipientId;
}

module.exports = generatedInfo;

module.exports = generateRecipientInfo;