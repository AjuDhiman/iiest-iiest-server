const fboModel = require('../models/fboSchema');

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
    let date = new Date();

    return { idNumber, generatedCustomerId, date}
}

module.exports = generatedInfo;