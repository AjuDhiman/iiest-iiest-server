const { foscosDocuments } = require("../../config/storage");
const docsModel = require("../../models/operationModels/documentsSchema");

const fs = require('fs');
const { logAudit } = require("../generalControllers/auditLogsControllers");
const { getDocObject, fostacDocPath, foscosDocPath, hraDocPath } = require("../../config/s3Bucket");


exports.saveDocument = async (req, res) => { //function for saving documents and adding it's src name and formata as an object in documets arry of oject in document collection finding it by handler id
    try {

        const file = req.files['document'];
        const id = req.params.id;
        const { name, format, multipleDoc, panelType, handlerId, customer_id, otherData } = req.body;
        let ref = '';

        console.log(req.body);

        let uploadedDoc;

        let issue_date;
        let expiery_date;
        let issueDateIso;
        let expiryDateIso;

        if (otherData) {
            const dataParsed = JSON.parse(otherData);
            issue_date = dataParsed.issue_date;
            expiery_date = dataParsed.expiery_date;
            if(issue_date && expiery_date){
                //converting to iso string
                issueDateIso = getIsoDate(issue_date);
                expiryDateIso = getIsoDate(expiery_date);
            }
        }


        const src = file.map(item => item.key); //getting src of each file
        const docObject = await docsModel.findOne({ handlerId: handlerId });
        if (docObject) {
            // Update the existing document by pushing the new document to the array
            uploadedDoc = await docObject.updateOne({
                $push: {
                    documents: {
                        name: name,
                        format: format,
                        multipleDoc: multipleDoc,
                        src: src,
                        customer_id: customer_id,
                        issue_date: issueDateIso,
                        expiery_date: expiryDateIso
                    }
                }
            });
        } else {
            uploadedDoc = await docsModel.create({  //create now obj in case of no history avlable
                handlerId: handlerId, documents: [
                    {
                        name: name,
                        format: format,
                        multipleDoc: multipleDoc,
                        src: src,
                        customer_id: customer_id,
                        issue_date: issue_date,
                        expiery_date: expiery_date
                    }
                ]
            });
        }

        if (!uploadedDoc) {
            res.status(401).json({ success: false, message: 'Document Saving Error' })
        }

        res.status(200).json({ success: true, message: 'File Uploaded' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

exports.getDocList = async (req, res) => { //gertting list of all docs relate to a id
    try {

        let success = false;

        const id = req.params.id;

        const handlerId = id.replace(/slash/g, '/'); // remove all word slash with /

        const docs = await docsModel.findOne({ handlerId: handlerId });

        if (!docs) {
            return res.status(204).json({ message: 'record no found', noDocErr: true })
        }

        const promises = [];

        //generating presigned urls for each src
        docs.documents.forEach((doc) => {
            const promise = (async () => {
                if (doc.multipleDoc) {
                    doc.src = await Promise.all(doc.src.map(async (src) => await getDocObject(src)));
                } else {
                    doc.src = await getDocObject(doc.src);
                }
            })();
            promises.push(promise);
        });

        await Promise.all(promises);

        if (!docs) {
            return res.status(201).json({ success, message: 'No Doc Found' });
        }

        success = true;

        return res.status(200).json({ success, docs: docs.documents });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.deleteDocs = async (req, res) => { //function for delertng a particular doc from a object of documents relarted to aparticilar id and with a specific name 
    try {

        const doc = req.body.docInfo;

        const shopId = req.params.id; //getting handler id from frontend

        const handlerId = shopId.replace(/slash/g, '/'); // remove all word slash with /

        const filePath = `./documents/foscos/${doc.src}`

        fs.unlink(filePath, (err, data) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(400).json({ message: 'FS File Error' });
            }
        })

        const updatedDoc = await docsModel.findOneAndUpdate(
            { _id: handlerId },
            { $pull: { documents: { name: doc.name } } },
            { new: true } // Return the updated document
        );

        if (!updatedDoc) {
            return res.status(404).json({ success: false, message: 'Can\'t Delete File' });
        }

        //code for audit loging if some one deletes the doc
        const prevVal = deletedDoc

        const currentVal = {};

        console.log(doc);

        await logAudit(req.user._id, "shopdetails", shopId, prevVal, currentVal, `${doc.name} deleted`);

        // code for tracking ends

        return res.status(200).json({ success: true, message: 'File Deleted Sucessfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//methord for deleting doc from s3
exports.deleteDocFromS3 = async (req, res) => {
    try {

        const { key } = req.body;

        await this.deleteDocFromS3(key);

        res.status(200).json({ message: 'Doc Deleted' })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//methord for generatig uplaod url for fostc
exports.generateFostacDocUploadURL = async (req, res) => {
    try {
        const { info } = req.body;
        //generating key for obj

        const key = `${fostacDocPath}${info.name}`;
        //generating uolaod url
        const uploadUrl = await uploadDocObject(key, info.format);

        return res.status(200).json({ uploadUrl: uploadUrl });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//methord for generatig uplaod url for foscos
exports.generateFoscosDocUploadURL = async (req, res) => {
    try {
        const { info } = req.body;
        //generating key for obj

        const key = `${foscosDocPath}${info.name}`;
        //generating uolaod url
        const uploadUrl = await uploadDocObject(key, info.format);

        return res.status(200).json({ uploadUrl: uploadUrl });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//methord for generatig uplaod url for hra
exports.generateHRADocUploadURL = async (req, res) => {
    try {
        const { info } = req.body;
        //generating key for obj

        const key = `${hraDocPath}${info.name}`;
        //generating uolaod url
        const uploadUrl = await uploadDocObject(key, info.format);

        return res.status(200).json({ uploadUrl: uploadUrl });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//methord for getting iso date
function getIsoDate(dateStr) {
    // Split the input string into parts (assuming it's in the format DD-MM-YYYY)
    const [year, month, day] = dateStr.split('-');

    // Create a new Date object using the parts
    const dateObj = new Date(`${year}-${month}-${day}`);

    // Convert the date object to an ISO string
    return dateObj.toISOString();
}