const TrainingBatchModel = require("../../models/trainingModels/trainingBatchModel");

exports.trainingBatch = async(req, res) => {
    try {

        let success = false;

        const enrollRecipient = req.enrollRecipient;

        const category = enrollRecipient.verificationInfo.recipientInfo.salesInfo.fostacInfo.fostac_service_name;

        const user = req.user;

        const openedBatch = await TrainingBatchModel.findOne({status: 'open', category: category});

        if(openedBatch) {

            if(openedBatch.candidateNo >= 50) {
                await TrainingBatchModel.findOneAndUpdate({status: 'open', category: category},
                { 
                    $inc: { candidateNo: 1 },
                    $push: { candidateDetails: enrollRecipient._id } 
                });
            } else {
                //close the btach if candidate number is grater than 50
                await TrainingBatchModel.findByIdAndUpdate({status: 'open', category: category},
                {
                    $inc: { candidateNo: 1 },
                    $push: { candidateDetails: enrollRecipient._id },
                    status: 'completed'
                })
            }

        } else { 
            //open new batch if batch with particular requirement is closed 
            await TrainingBatchModel.create({operatorInfo: user._id, status: 'open', category: category, batchCode:'Batch1', location: 'Delhi', candidateNo: 1, candidateDetails: [enrollRecipient._id] });
        }

        return res.status(200).json({ success, message: 'Enrolled recipient', enrolledId: enrollRecipient._id });
    } catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}

exports.getTrainingBatchData = async(req, res) => {
    try {
        let success = false;

        const batches = await TrainingBatchModel.find().populate({ path:'candidateDetails' , populate: {path: 'verificationInfo', populate: { path: 'recipientInfo', populate:{ path: 'salesInfo', populate: [{path: 'employeeInfo'}, {path: 'fboInfo'}]}}}});;

        if(!batches) {
           return res.status(204).json({message: 'Data Not Found'})
        } 

        success = true;
        return res.status(200).json({success, batches})

    } catch(error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}