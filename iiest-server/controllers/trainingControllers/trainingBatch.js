const { generatedBatchInfo, generatedAuditBatchInfo } = require("../../Training/generateCredential");
const auditBatchModel = require("../../models/auditModels/auditBatchModel");
const AuditBatchModel = require("../../models/auditModels/auditBatchModel");
const { recipientModel, hygieneShopModel } = require("../../models/fboModels/recipientSchema");
const generalDataSchema = require("../../models/generalModels/generalDataSchema");
const { fostacVerifyModel, hraVerifyModel } = require("../../models/operationModels/verificationSchema");
const TrainingBatchModel = require("../../models/trainingModels/trainingBatchModel");
const { sendVerificationMail } = require("../../operations/sendMail");
const { logAudit } = require("../generalControllers/auditLogsControllers");

exports.trainingBatch = async (req, res) => {
    try {

        let success = false;

        const verificationInfo = req.verificationInfo;

        const recipientId = req.params.recipientid;

        const recipientInfo = await recipientModel.findOne({ _id: recipientId }).populate({ path: 'salesInfo', populate: [{ path: 'fboInfo' }, { path: 'employeeInfo' }] });

        const category = recipientInfo.salesInfo.fostacInfo.fostac_service_name;

        const user = req.user;

        const state = recipientInfo.salesInfo.fboInfo.state;

        const district = recipientInfo.salesInfo.fboInfo.district;

        let location;

        if (state === 'Delhi') {
            location = 'Delhi';
        } else if (district === 'Gurgaon') {
            location = 'Gurgaon';
        } else if (district === 'Gautam Buddha Nagar') {
            location = 'Noida';
        } else if (district === 'Faridabad') {
            location = 'Faridabad';
        } else if (district === 'Ghaziabad') {
            location = 'Ghaziabad';
        }

        if (!location) {
            console.log(verificationInfo);
            await fostacVerifyModel.findByIdAndDelete(verificationInfo._id);//delete verification if not exsists
            return res.status(401).json({ success: false, locationErr: true })
        }

        let batchData;

        const openedBatch = await TrainingBatchModel.findOne({ status: 'open', category: category, location: location });

        if (openedBatch) {

            if (openedBatch.candidateNo < 99) {
                batchData = await TrainingBatchModel.findOneAndUpdate({ status: 'open', category: category, location: location },
                    {
                        $inc: { candidateNo: 1 },
                        $push: { candidateDetails: verificationInfo._id }
                    });
            } else {
                //close the btach if candidate number is grater than or equal to 50
                batchData = await TrainingBatchModel.findOneAndUpdate({ status: 'open', category: category, location: location },
                    {
                        $inc: { candidateNo: 1 },
                        $push: { candidateDetails: verificationInfo._id },
                        status: 'completed'
                    });
            }

        } else {
            //open new batch if batch with particular requirement is closed 
            const batchInfo = await generatedBatchInfo();

            batchData = await TrainingBatchModel.create({ operatorInfo: user._id, id_num: batchInfo.idNumber, status: 'open', category: category, batchCode: batchInfo.generatedBatchCode, location: location, candidateNo: 1, candidateDetails: [verificationInfo._id] });
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

        const batches = await TrainingBatchModel.find().populate({ path: 'candidateDetails', populate: { path: 'recipientInfo', populate: { path: 'salesInfo', populate: [{ path: 'employeeInfo' }, { path: 'fboInfo' }] } } });


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

        const batchPrevData = await TrainingBatchModel.findById(batchId);

        const updatedBatch = await TrainingBatchModel.findByIdAndUpdate(batchId, { trainer: trainer, venue: venue, trainingDate: training_date });

        let emailArr = [];

        if (!updatedBatch) {
            success = false;
            return res.status(401).json({ success: false, incompleteDataErr: true });
        }

        const batchInfo = await updatedBatch.populate({ path: 'candidateDetails' });

        for (let i = 0; i < batchInfo.candidateDetails.length; i++) {

            const prevVal = {}

            const currentVal = updatedBatch;

            let action;

            if (batchPrevData.trainingDate) {
                action = `Fostac training date changed from ${getFormatedDate(batchPrevData.trainingDate)} to ${getFormatedDate(updatedBatch.trainingDate)}`
            } else {
                action = `Fostac training date(${getFormatedDate(updatedBatch.trainingDate)}) Given`
            }

            emailArr.push(batchInfo.candidateDetails[i].email);

            await logAudit(req.user._id, "recipientdetails", batchInfo.candidateDetails[i].recipientInfo, prevVal, currentVal, action);

            // code for tracking ends
        }

        let clientData = {
            product: 'training_date_allotment',
            trainingDate: training_date,
            trainer: trainer,
            venue: venue,
            recipientEmail: emailArr,
        }

        sendVerificationMail(clientData);

        res.status(200).json({ success: true, batchInfo: updatedBatch });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

exports.auditBatch = async (req, res) => {
    try {

        let success = false;

        const { state, district, pincode, food_handler_no } = req.body

        const verificationInfo = req.verificationInfo;

        const shopId = req.params.shopid;

        const verificationDate = new Date(verificationInfo.createdAt);

        const shopInfo = await hygieneShopModel.findOne({ _id: shopId }).populate({ path: 'salesInfo', populate: [{ path: 'fboInfo' }, { path: 'employeeInfo' }] });

        const user = req.user;

        const ourHolidays = [
            { date: '26-Jan-2024', name: 'Republic Day' },
            { date: '08-Mar-2024', name: 'Mahashivratri' },
            { date: '25-Apr-2024', name: 'Holi' },
            { date: '29-Apr-2024', name: 'Good Friday' },
            { date: '11-Apr-2024', name: 'Eid Al-Fitr' },
            { date: '11-Jun-2024', name: 'Eid Al-Zuha(Bakrid)' },
            { date: '15-Aug-2024', name: 'Independence Day' },
            { date: '19-Aug-2024', name: 'Raksha Bandhan' },
            { date: '26-Sept-2024', name: 'Janmashtami' },
            { date: '02-Oct-2024', name: 'Gandhi Jayanti' },
            { date: '12-Oct-2024', name: 'Dussehra' },
            { date: '01-Nov-2024', name: 'Diwali' },
            { date: '02-Nov-2024', name: 'Govardhan Pooja' },
            { date: '03-Nov-2024', name: 'Bhai Dooj' },
            { date: '25-Dec-2024', name: 'Christmas' },
        ];    

        let location;

        if (state === 'Delhi') {
            location = 'Delhi';
        } else if (district === 'Gurgaon') {
            location = 'Gurgaon';
        } else if (district === 'Gautam Buddha Nagar') {
            location = 'Noida';
        } else if (district === 'Faridabad') {
            location = 'Faridabad';
        } else if (district === 'Ghaziabad') {
            location = 'Ghaziabad';
        }

        if (!location) {
            console.log(verificationInfo);
            await hraVerifyModel.findByIdAndDelete(verificationInfo._id);//delete verification if not exsists
            return res.status(401).json({ success: false, locationErr: true })
        }

        const generalData = await generalDataSchema.find()// get list of all auditors from general datas

        const allAuditors = [
            'Umar Shakil',
        ]

        console.log(generalData[0]);

        const sessionsNo = Math.ceil(food_handler_no / 50);

        var avilableAuditors = allAuditors;

        const auditDays = sessionsNo / 2;

        let date = verificationDate;
        date.setDate(date.getDate() + 7)

        while (ourHolidays.find((item) => item.date === getFormatedDate(date.toString())) || date.getUTCDay() === 0) {
            date.setDate(date.getDate() + 1);
        }


        let batchData;

        const openedBatch = await AuditBatchModel.find({ status: 'open', location: location, pincodes: { $in: [pincode] } });

        console.log(pincode);
        console.log('open batch', openedBatch);

        if (sessionsNo % 2 == 0 || !openedBatch || openedBatch.length === 0) {

            let dayAvilable = false;

            let auditDatesArr = [];

            while (!dayAvilable) {

                let daysToEsacpe = 0;

                for (i = 0; i < auditDays; i++) { // we will check avliablity of auditor for continiously no of audit days for a candidate

                    console.log('i', i)
                    let day = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i + daysToEsacpe, 0, 0, 1);
                    console.log('Orignal Day', day.toUTCString(), day.getDay());
                    let holidayNum = 0;

                    while (ourHolidays.find((item) => item.date === getFormatedDate(day.toString())) || day.getUTCDay() === 0) {
                        day.setDate(day.getDate() + 1);
                        holidayNum++;
                    } //we will shift day a day after is that day is a holiday or sunday

                    daysToEsacpe += holidayNum

                    console.log('Modified Day', day.toUTCString());

                    const batchesOnDate = await auditBatchModel.find({
                        auditDates: {
                            $elemMatch: {
                                $gte: day,
                                $lt: new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 1)
                            }
                        }
                    });

                    const auditorsOnDate = batchesOnDate.map((batch) => batch.auditor)

                    if ((allAuditors.length === auditorsOnDate.length) || avilableAuditors.length === 0) {
                        date.setDate(date.getDate() + i + holidayNum + 1);
                        break; // break the loop if all auditors are booked any of the day or not same auditor is avilble on all days
                    } else {
                        console.log(2, avilableAuditors);
                        dayAvilable = true;
                        avilableAuditors = avilableAuditors.filter((auditor) => !auditorsOnDate.includes(auditor));
                        auditDatesArr.push(day);
                    }
                }

            }

            let auditor = getRandomItemFromArr(avilableAuditors);

            console.log(auditor)

            const batchInfo = await generatedAuditBatchInfo();

            const pincodeArr = [
                Number(pincode) - 1,
                Number(pincode),
                Number(pincode) + 1
            ];

            if (!openedBatch || openedBatch.length === 0) {
                batchData = await auditBatchModel.create({ id_num: batchInfo.idNumber, status: 'open', batchCode: batchInfo.generatedBatchCode, location: location, auditNum: 1, candidateDetails: [verificationInfo._id], pincodes: pincodeArr, auditDates: auditDatesArr, auditor: auditor });
            } else {
                batchData = await auditBatchModel.create({ id_num: batchInfo.idNumber, status: 'completed', batchCode: batchInfo.generatedBatchCode, location: location, auditNum: 1, candidateDetails: [verificationInfo._id], pincodes: pincodeArr, auditDates: auditDatesArr, auditor: auditor });
            }

        } else {

            if (sessionsNo === 1) { // in case of single session we doesn't have to check avilablity of same auditor in extra days
                batchData = await auditBatchModel.findOneAndUpdate(
                    { status: 'open', location: location, pincodes: { $in: [pincode] } },
                    {
                        $set: {
                            status: 'completed'
                        },
                        $inc: {
                            auditNum: 1
                        },
                        $push: {
                            candidateDetails: verificationInfo._id
                        }
                    },
                    { new: true }
                );
            } else {

                // let auditDatesArr;

                // let randomBatch = getRandomItemFromArr(openedBatch);

                // const auditor = randomBatch.auditor;

                // let dates = [];

                // const auditorNotAvailable = await auditBatchModel.findOne({
                //     auditDates: {
                //         $elemMatch: {
                //             date: { $in: dates },
                //             auditors: auditor
                //         }
                //     }
                // });

                // let batchData = await auditBatchModel.findOneAndUpdate(
                //     { status: 'open', location: location, pincodes: { $in: [pincode] } },
                //     { $push: { pincodes: { $each: auditDatesArr } } },
                //     { new: true }
                // );
            }
        }

        if (batchData) {
            sendVerificationMail(req.clientData);
            return res.status(200).json({ success: true, verificationData: verificationInfo })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getAuditBatchData = async (req, res) => {
    try {
        let success = false;

        const batches = await auditBatchModel.find().populate({ path: 'candidateDetails', populate: { path: 'shopInfo', populate: { path: 'salesInfo', populate: [{ path: 'employeeInfo' }, { path: 'fboInfo' }] } } });


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

function getFormatedDate(date) {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = months[originalDate.getMonth()];
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}

function getRandomItemFromArr(arr) {

    const length = arr.length;

    console.log('arr', arr);

    const randomIndex = Math.floor(Math.random() * (length));

    console.log('index', randomIndex, arr[randomIndex]);

    return arr[randomIndex];
}

async function getAuditDate(verificationDate) {

    const updatedHolidays = [
        { date: '26-Jan-2024', name: 'Republic Day' },
        { date: '08-Mar-2024', name: 'Mahashivratri' },
        { date: '25-Apr-2024', name: 'Holi' },
        { date: '29-Apr-2024', name: 'Good Friday' },
        { date: '11-Apr-2024', name: 'Eid Al-Fitr' },
        { date: '11-Jun-2024', name: 'Eid Al-Zuha(Bakrid)' },
        { date: '15-Aug-2024', name: 'Independence Day' },
        { date: '19-Aug-2024', name: 'Raksha Bandhan' },
        { date: '26-Sept-2024', name: 'Janmashtami' },
        { date: '02-Oct-2024', name: 'Gandhi Jayanti' },
        { date: '12-Oct-2024', name: 'Dussehra' },
        { date: '01-Nov-2024', name: 'Diwali' },
        { date: '02-Nov-2024', name: 'Govardhan Pooja' },
        { date: '03-Nov-2024', name: 'Bhai Dooj' },
        { date: '25-Dec-2024', name: 'Christmas' },
    ];

    const allAuditors = await generalDataSchema.find()[0].auditors;// get list of all auditors from general datas

    const sessionsNo = 1;

    const auditDays = sessionsNo / 2;

    var avilableAuditors = allAuditors;

    let date = verificationDate;
    date.setDate(date.getDate() + 7)

    while (ourHolidays.find((item) => item.date === this.getFormatedDate(date.toString())) || date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
    }

    let batchData;

    if (sessionsNo % 2 == 0) {

        const dayAvilable = false;

        let auditDatesArr = [];

        let daysToEsacpe = 0;

        while (!dayAvilable) {

            for (i = 0; i < auditDays; i++) { // we will check avliablity of auditor for continiously no of audit days for a candidate

                let day = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i + daysToEsacpe, 0, 0, 0);//increase day by days to Eascape
                let holidayNum = 0;

                while (ourHolidays.find((item) => item.date === this.getFormatedDate(day.toString())) || day.getUTCDay() === 0) {
                    day.setDate(day.getDate() + 1);
                    holidayNum++;
                } //we will shift day a day after is that day is a holiday or sunday

                daysToEsacpe += holidayNum;

                console.log('days to eascape', daysToEsacpe)

                const batchesOnDate = await auditBatchModel.find({
                    auditDates: {
                        $elemMatch: {
                            $gte: day,
                            $lt: new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0)
                        }
                    }
                });

                const auditorsOnDate = batchesOnDate.map((batch) => batch.auditor)

                if ((allAuditors.length === auditorsOnDate.length) || avilableAuditors.length === 0) {
                    date.setDate(date.getDate() + i + daysToEsacpe);
                    break; // break the loop if all auditors are booked any of the day or not same auditor is avilble on all days
                } else {
                    avilableAuditors = avilableAuditors.filter((auditor) => auditorsOnDate.includes(auditor));
                    auditDatesArr.push(day)
                    dayAvilable = true;
                }
            }

        }

        const batchInfo = await generatedAuditBatchInfo();

        const pincodeArr = [
            Number(pincode) - 1,
            Number(pincode),
            Number(pincode) + 1
        ]

        batchData = await auditBatchModel.create({ id_num: batchInfo.idNumber, status: 'open', batchCode: batchInfo.generatedBatchCode, location: location, auditNum: 1, candidateDetails: [verificationInfo._id], pincodes: pincodeArr, auditDates: auditDatesArr });

    }

    // const avilableAuditors = allAuditors.filter((auditor) => auditor.isAvilable);
}


exports.getCandidateAuditBatch = async (req, res) => {
    try {

        const verificationId = req.params.verificationid;

        const candidateBatch = await auditBatchModel.findOne({
            candidateDetails:
            {
                $in: [verificationId]
            }
        }).populate({path: 'candidateDetails', populate: {path: 'shopInfo'}});

        return res.status(200).json({batchData: candidateBatch, success: true})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}
