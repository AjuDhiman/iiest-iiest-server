const fboModel = require('../models/fboSchema');
const { recipientValidationSchema, shopValidationSchema } = require('../models/recipientSchema');
const { createFsBucket } = require('../config/db')

exports.addRecipient = async (req, res) => {
    try {
        const objId = req.params.id;
        let success = false;
        let recipientData;

        const selectedFbo = await fboModel.findById(objId);

        if (!selectedFbo) {
            return res.status(404).json({ success, message: 'FBO not found' });
        }

        if (req.file) {
            const shopBody = req.body;
            const file = req.file;
            const bucket = createFsBucket();
            const uploadStream = bucket.openUploadStream(`${Date.now()}_${file.originalname}`);

            uploadStream.write(file.buffer);

            uploadStream.end((err) => {
            if (err) {
                console.error(err);
            } 
                console.log(`File ${file.originalname} uploaded successfully.`);
            });
            const shopDataValid = await shopValidationSchema.validateAsync(shopBody);
            recipientData = shopDataValid;

            selectedFbo.shopDetails.push(recipientData);
        
            const updatedFboData = await selectedFbo.save();
    
            if (!updatedFboData) {
                return res.status(404).json({ success, message: 'FBO not found' });
            }
    
            success = true;
            return res.status(200).json({ success, message: 'Recipients added successfully', data: updatedFboData.recipientDetails });

        } else {
            const recipientBody = req.body;
            const recipientDataValid = await recipientValidationSchema.validateAsync(recipientBody);
            recipientData = recipientDataValid;

            selectedFbo.recipientDetails.push(recipientData);
        
            const updatedFboData = await selectedFbo.save();
    
            if (!updatedFboData) {
                return res.status(404).json({ success, message: 'FBO not found' });
            }
    
            success = true;
            return res.status(200).json({ success, message: 'Recipients added successfully', data: updatedFboData.recipientDetails });

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
