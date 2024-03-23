const { foscosDocuments } = require("../../config/storage");
const docsModel = require("../../models/operationModels/documentsSchema");

const fs = require('fs');


exports.saveDocument = async (req, res) => {
    try {

        const file = req.files['document'];
        const id = req.params.id;
        const { name, format, multipleDoc } = req.body;

        const src = file.map(item => item.filename);
        const uploadedDoc = await docsModel.create({ handlerInfo: id, name: name, format: format, multipleDoc: multipleDoc, src: src })

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

        const docs = await docsModel.find({ handlerInfo: id }).select('-handlerInfo');

        if (!docs) {
            return res.status(201).json({ success, message: 'No Doc Found' });
        }

        success = true;

        return res.status(200).json({ success, docs });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.deleteDocs = async (req, res) => {
    try {

        const doc = req.body.docInfo;

        const filePath = `./documents/foscos/${doc.src}`

        fs.unlink(filePath, (err, data) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(400).json({message: 'FS File Error'});
            }
        })

        const deletedDoc = await docsModel.findByIdAndDelete(doc._id);

        if (!deletedDoc) {
            return res.status(404).json({ success: false, message: 'Can\'t Delete File' });
        }
 
        //code for audit loging if some one deletes the doc
         const prevVal = deletedDoc
 
         const currentVal = {};
 
         await logAudit(req.user._id, "shopsdetails", doc.handlerInfo, prevVal, currentVal, `${doc.name} deleted`);
 
         // code for tracking ends

        return res.status(200).json({success: true, message:'File Deleted Sucessfully'});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}