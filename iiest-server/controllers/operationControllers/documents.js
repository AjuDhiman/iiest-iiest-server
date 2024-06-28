const { foscosDocuments } = require("../../config/storage");
const docsModel = require("../../models/operationModels/documentsSchema");

const fs = require('fs');
const { logAudit } = require("../generalControllers/auditLogsControllers");


exports.saveDocument = async (req, res) => {
    try {

        const file = req.files['document'];
        const id = req.params.id;
        const { name, format, multipleDoc, panelType, handlerId } = req.body;
        let ref = '';

        console.log(file);

        let uploadedDoc

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
                        src: src
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
                        src: src
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

exports.getDocList = async (req, res) => {
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

exports.deleteDocs = async (req, res) => {
    try {

        const doc = req.body.docInfo;

        const shopId = req.params.id;

        const filePath = `./documents/foscos/${doc.src}`

        fs.unlink(filePath, (err, data) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(400).json({ message: 'FS File Error' });
            }
        })

        const deletedDoc = await docsModel.findByIdAndDelete(doc._id);

        if (!deletedDoc) {
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