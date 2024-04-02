const { generatedBatchInfo } = require("../../Training/generateCredential");
const { recipientModel } = require("../../models/fboModels/recipientSchema");
const { fostacVerifyModel } = require("../../models/operationModels/verificationSchema");
const TrainingBatchModel = require("../../models/trainingModels/trainingBatchModel");
const { logAudit } = require("../generalControllers/auditLogsControllers");

exports.trainingBatch = async (req, res) => {
    try {

        let success = false;

        const verificationInfo = req.verificationInfo;

        const recipientId = req.params.recipientid;

        const recipientInfo = await recipientModel.findOne({_id: recipientId}).populate({path: 'salesInfo', populate: [{path: 'fboInfo'}, {path: 'employeeInfo'}]});

        const category = recipientInfo.salesInfo.fostacInfo.fostac_service_name;

        const user = req.user;
        
        const state = recipientInfo.salesInfo.fboInfo.state;

        const district = recipientInfo.salesInfo.fboInfo.district;

        let location;

        if(state === 'Delhi') {
            location = 'Delhi';
        } else if(district === 'Gurgaon') {
            location = 'Gurgaon';
        } else if(district === 'Gautam Buddha Nagar') {
            location = 'Noida';
        } else if(district === 'Faridabad') {
            location = 'Faridabad';
        } else if(district === 'Ghaziabad') {
            location = 'Ghaziabad';
        }

        if(!location) {
            console.log(verificationInfo);
            await fostacVerifyModel.findByIdAndDelete(verificationInfo._id);//delete verification if not exsists
            return res.status(401).json({success: false, locationErr: true})
        }

        let batchData;

        const openedBatch = await TrainingBatchModel.findOne({ status: 'open', category: category, location: location });

        if (openedBatch) {

            if (openedBatch.candidateNo < 9) {
                batchData = await TrainingBatchModel.findOneAndUpdate({ status: 'open', category: category, location: location },
                    {
                        $inc: { candidateNo: 1 },
                        $push: { candidateDetails: verificationInfo._id }
                    });
            } else {
                //close the btach if candidate number is grater than or equal to 50
                batchData = await TrainingBatchModel.findOneAndUpdate({ status: 'open', category: category, location: location},
                    {
                        $inc: { candidateNo: 1 },
                        $push: { candidateDetails: verificationInfo._id },
                        status: 'completed'
                    });
            }

        } else {
            //open new batch if batch with particular requirement is closed 
            const batchInfo = await generatedBatchInfo();

            batchData = await TrainingBatchModel.create({ operatorInfo: user._id, id_num: batchInfo.idNumber, status: 'open', category: category, batchCode:  batchInfo.generatedBatchCode, location: location, candidateNo: 1, candidateDetails: [verificationInfo._id] });
        }

        success = true;
        return res.status(200).json({ success, verificationInfo: verificationInfo, batchData: batchData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getTrainingBatchData = async (req, res) => {
    try {
        let success = false;

        const batches = await TrainingBatchModel.find().populate({ path: 'candidateDetails', populate: { path: 'recipientInfo', populate: { path: 'salesInfo', populate: [{ path: 'employeeInfo' }, { path: 'fboInfo' }] } }  });;

        if (!batches) {
            return res.status(204).json({ message: 'Data Not Found' })
        }

        success = true;
        return res.status(200).json({ success, batches })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.updateBatch = async (req, res) => {
    console.log(11);
    try {

        let success = false;

        const batchId = req.params.batchid;

        const { training_date, trainer, venue } = req.body;

        console.log(req.body)

        const batchPrevData = await TrainingBatchModel.findById(batchId);

        const updatedBatch = await TrainingBatchModel.findByIdAndUpdate(batchId, {trainer: trainer, venue: venue, trainingDate: training_date});

        if(!updatedBatch) {
            success = false;
            return res.status(401).json({success: false, incompleteDataErr: true});
        }

        const batchInfo = await updatedBatch.populate({path: 'candidateDetails'});

        for(let i = 0; i< batchInfo.candidateDetails.length; i++) {
    
            const prevVal = {}
    
            const currentVal = updatedBatch;

            let action;
            
            if(batchPrevData.trainingDate){
                action = `Fostac training date changed from ${getFormatedDate(batchPrevData.trainingDate)} to ${getFormatedDate(updatedBatch.trainingDate)}`
            } else {
                action = `Fostac training date(${getFormatedDate(updatedBatch.trainingDate)}) Given`
            }
    
            await logAudit(req.user._id, "recipientdetails", batchInfo.candidateDetails[i].recipientInfo, prevVal, currentVal, action);
    
            // code for tracking ends
        }

        res.status(200).json({success: true, batchInfo: updatedBatch});

    } catch(error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'});
    }

}

function getFormatedDate(date) {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = months[originalDate.getMonth()];
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}