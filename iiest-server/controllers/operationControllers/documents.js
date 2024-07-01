const { foscosDocuments } = require("../../config/storage");
const docsModel = require("../../models/operationModels/documentsSchema");

const fs = require('fs');
const { logAudit } = require("../generalControllers/auditLogsControllers");


exports.saveDocument = async (req, res) => { //function for saving documents and adding it's src name and formata as an object in documets arry of oject in document collection finding it by handler id
    try {

        const file = req.files['document'];
        const id = req.params.id;
        const { name, format, multipleDoc, panelType, handlerId, customer_id } = req.body;
        let ref = '';

        console.log(file);

        let uploadedDoc;

        const src = file.map(item => item.filename); //getting src of each file
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
                        customer_id: customer_id
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
                        customer_id: customer_id
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