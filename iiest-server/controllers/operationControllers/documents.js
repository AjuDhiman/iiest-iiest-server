const { foscosDocuments } = require("../../config/storage");
const docsModel = require("../../models/operationModels/documentsSchema");


exports.saveDocument = async(req, res) => {
    try {

        const file = req.files['document'];
        const id = req.params.id;
        const {name, format, multipleDoc} = req.body;

        const src = file.map(item => item.filename);
        const uploadedDoc = await docsModel.create({handlerInfo: id, name:name, format: format, multipleDoc:multipleDoc, src: src})

        if(!uploadedDoc) {
            res.status(401).json({success: false, message: 'Document Saving Error'})
        }

        res.status(200).json({success: true, message:'File Uploaded'});

    } catch(error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

exports.getDocList = async(req,res) => {
    try {

        let success = false;

        const id = req.params.id;

        const docs = await docsModel.find({handlerInfo: id}).select('-handlerInfo -_id');

        if(!docs) {
            return res.status(201).json({success, message: 'No Doc Found'});
        }

        success = true;

        return res.status(200).json({success, docs});

    } catch(error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}