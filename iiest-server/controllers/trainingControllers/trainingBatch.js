const { generatedBatchInfo } = require("../../Training/generateCredential");
const fostacEnrollmentModel = require("../../models/operationModels/enrollmentSchema");
const TrainingBatchModel = require("../../models/trainingModels/trainingBatchModel");

exports.trainingBatch = async (req, res) => {
    try {

        let success = false;

        const enrollRecipient = req.enrollRecipient;

        const verificationInfo = req.verificationInfo;

        const category = verificationInfo.recipientInfo.salesInfo.fostacInfo.fostac_service_name;

        const user = req.user;
        
        const state = verificationInfo.recipientInfo.salesInfo.fboInfo.state;

        const district = verificationInfo.recipientInfo.salesInfo.fboInfo.district;

        let location;

        if(state === 'Delhi') {
            location = 'Delhi';
        } else if(district === 'Gurgaon') {
            location = 'Gurgaon'
        } else if(district === 'Gautam Buddha Nagar') {
            location = 'Noida'
        }

        const openedBatch = await TrainingBatchModel.findOne({ status: 'open', category: category, location: location });

        if (openedBatch) {

            if(enrollRecipient.fostac_training_date !== openedBatch.trainingDate.toISOString().slice(0,10)) {
                await fostacEnrollmentModel.findByIdAndDelete(enrollRecipient._id);// delete recipient enrollment data if already created
                return res.status(401).json({success: false, openBatchErr: true, openBatchDate: openedBatch.trainingDate, openBatchCategory: openedBatch.category, openBatchLocation: openedBatch.location});
            }

            if (openedBatch.candidateNo < 50) {
                await TrainingBatchModel.findOneAndUpdate({ status: 'open', category: category, location: location },
                    {
                        $inc: { candidateNo: 1 },
                        $push: { candidateDetails: enrollRecipient._id }
                    });
            } else {
                //close the btach if candidate number is grater than or equal to 50
                await TrainingBatchModel.findOneAndUpdate({ status: 'open', category: category, location: location},
                    {
                        $inc: { candidateNo: 1 },
                        $push: { candidateDetails: enrollRecipient._id },
                        status: 'completed'
                    });
            }

        } else {
            //open new batch if batch with particular requirement is closed 
            const batchInfo = await generatedBatchInfo();

            await TrainingBatchModel.create({ operatorInfo: user._id, id_num: batchInfo.idNumber, status: 'open', category: category, batchCode:  batchInfo.generatedBatchCode, location: location, candidateNo: 1, candidateDetails: [enrollRecipient._id], trainingDate:enrollRecipient.fostac_training_date });
        }

        return res.status(200).json({ success, message: 'Enrolled recipient', enrolledId: enrollRecipient._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getTrainingBatchData = async (req, res) => {
    try {
        let success = false;

        const batches = await TrainingBatchModel.find().populate({ path: 'candidateDetails', populate: { path: 'verificationInfo', populate: { path: 'recipientInfo', populate: { path: 'salesInfo', populate: [{ path: 'employeeInfo' }, { path: 'fboInfo' }] } } } });;

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

        const batchId = req.params.batchid;

        const { training_date, trainer, venue } = req.body;

        let updatedBatch;

        if(trainer){
            updatedBatch = await TrainingBatchModel.findByIdAndUpdate(batchId, {trainer: trainer});
        }

        if(training_date) {
            updatedBatch = await TrainingBatchModel.findByIdAndUpdate(batchId, {trainingDate: training_date});
        }

        if(venue) {
            updatedBatch = await TrainingBatchModel.findByIdAndUpdate(batchId, {venue: venue});
        }

        res.status(200).json({success: true, batchInfo: updatedBatch});

    } catch(error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'});
    }

}