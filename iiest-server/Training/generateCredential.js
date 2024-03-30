const TrainingBatchModel = require("../models/trainingModels/trainingBatchModel");

const generateBatchCode = (randonNum)=>{
    let customerId = '';
    customerId = `Batch/${randonNum}`;
    return customerId
}

const generatedBatchInfo = async()=>{
    let isUnique = false;
    let idNumber;

    while (!isUnique) {
      idNumber = Math.floor(10000 + Math.random() * 90000);
      const existingNumber = await TrainingBatchModel.findOne({ id_num: idNumber });
      if (!existingNumber) {
        isUnique = true;
      }
    }

    const generatedBatchCode = generateBatchCode(idNumber);

    return { idNumber, generatedBatchCode }
}

module.exports = { generatedBatchInfo };