const salesModel = require('../models/employeeModels/employeeSalesSchema');
const fboModel = require('../models/fboModels/fboSchema');
const { recipientModel, shopModel } = require('../models/fboModels/recipientSchema');
const boModel = require('../models/BoModels/boSchema');
const generalDataSchema = require('../models/generalModels/generalDataSchema');

let generateCustomerId = (randonNum) => { //methord for generating customer id for fbo or shopb by the help of random num
  let customerId = '';
  customerId = `IIEST/SP/${randonNum}`;
  return customerId
}

let generateMemberId = (randonNum) => {//methord for generating customer id for bo or member by the help of random num
  let customerId = '';
  customerId = `IIEST/MB/${randonNum}`;
  return customerId
}

const generateUniqueId = async () => { //generating unique id num bo or member for creating unique bo id
  let isUnique = false; //initialing unique as false
  let idNumber;

  while (!isUnique) { // loop will continue in case unique id num is not found
    idNumber = Math.floor(100000 + Math.random() * 900000) - 1;
    const existingNumber = await boModel.findOne({ id_num: idNumber });
    if (!existingNumber) {
      isUnique = true;
    }
  }

  const generatedUniqueCustomerId = generateMemberId(idNumber);
  return { idNumber, generatedUniqueCustomerId }
}

const generatedInfo = async () => {  //generating unique id num shop  for creating unique shop id
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

  return { idNumber, generatedCustomerId }
}

const generateRecipientInfo = async (salesId) => {  //generating unique id num recipient for creating unique recipient id
  let isUnique = false;
  let idNumber;

  while (!isUnique) { // loop will continue in case unique id num is not found
    idNumber = Math.floor(10000 + Math.random() * 9000);
    const existingNumber = await recipientModel.findOne({ id_num: idNumber });
    if (!existingNumber) {
      isUnique = true;
    }
  }

  let recipientId = await getRecipientId(salesId, idNumber);

  return { idNumber, recipientId };
}

const getRecipientId = async (salesId, idNumber) => {  //methord for generating customer id for recipient by the help of random num
  let recipientId = '';

  const empSales = await salesModel.findOne({ _id: salesId }).populate({ path: 'fboInfo' });

  recipientId = `${empSales.fboInfo.customer_id}/REC/${idNumber}` //genearing recipint id with refrence to fbo id

  return recipientId;
}


const generateInvoiceCode = async (business_type) => {  //methord for generating invoice Id

  //generating invoice code of type (company/fianacial year/tax code/invoice number)
  //getting financial year
  const date = new Date();
  let firstYear = '';
  let secondYear = '';
  if (date.getMonth() < 2) {
    firstYear = `${(date.getFullYear() - 1).toString().split('').slice(-2).join('')}`;
    secondYear = `${date.getFullYear().toString().split('').slice(-2).join('')}`;
  } else {
    firstYear = `${date.getFullYear().toString().split('').slice(-2).join('')}`;
    secondYear = `${(date.getFullYear() + 1).toString().split('').slice(-2).join('')}`;
  }

  let financialYear = `${firstYear}-${secondYear}`

  //getting taxcode
  let taxCode = '';

  if (business_type === 'b2b') {
    taxCode = 'TX';
  } else if (business_type === 'b2c') {
    taxCode = 'CI';
  }

  //getting invoice number
  const generalData = (await generalDataSchema.find({}))[0];

  const invoice_details = generalData.invoice_details;

  console.log(invoice_details);

  let invoice_num;

  if (business_type === 'b2b') {
    invoice_num = Number(invoice_details.b2b.last_invoice_num);
  } else {
    invoice_num = Number(invoice_details.b2c.last_invoice_num);
  }

  const invoice_code = `FD/${financialYear}/${taxCode}/${invoice_num}`;

  //inc last invoice num in general data

  if (business_type == 'b2b') {
    await generalDataSchema.findOneAndUpdate({
      _id: generalData._id
    },
      {
        $inc: {
          "invoice_details.b2b.last_invoice_num": 1
        }
      })
  } else if (business_type == 'b2c') {
    await generalDataSchema.findOneAndUpdate(
      {
        _id: generalData._id
      },
      {
        $inc: {
          "invoice_details.b2c.last_invoice_num": 1
        }
      }
    )
  }

  return invoice_code;
}

module.exports = { generateUniqueId, generatedInfo, generateRecipientInfo, generateInvoiceCode };