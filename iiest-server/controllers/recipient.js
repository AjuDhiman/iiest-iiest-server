const fboModel = require('../models/fboSchema');
const { recipientValidationSchema, shopValidationSchema } = require('../models/recipientSchema');
const { createFsBucket } = require('../config/db')

exports.addRecipient = async (req, res) => {
    try {
        const objId = req.params.id;

        let aadharErr = false;

        const selectedFbo = await fboModel.findById(objId);

        if (!selectedFbo) {
            return res.status(404).json({ success, message: 'FBO not found' });
        }

        const recipientBody = req.body;

        const recipientBodyValid = await recipientValidationSchema.validateAsync(recipientBody);

        selectedFbo.recipientDetails.forEach((elem)=>{
            if(elem.aadharNo === recipientBodyValid.aadharNo){
               aadharErr = true;
            }
        })

        if(aadharErr){
            return res.status(401).json({aadharErr, message: 'This aadhar number already exits'});
        }

       const addedRecipient =  await fboModel.findByIdAndUpdate(objId, {$push: {"recipientDetails": recipientBodyValid}}, {new: true});
    
       if(!addedRecipient){
        success = false;
        return res.status(404).json({ success, message: 'Some error occured' });
       }
        
       success = true;
       return res.status(200).json({ success, message: 'Recipients added successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.addShop = async(req, res)=>{
    try {
        const objId = req.params.id;
        let success = false;
        let addressErr = false;

        const selectedFbo = await fboModel.findById(objId);

        if (!selectedFbo) {
            success = false;
            return res.status(401).json({ success, message: 'FBO not found' });
        }
            
        const file = req.file;

        const uniqueBillName = `${Date.now()}_${file.originalname}`

        const shopBody = {...req.body, eBillName: uniqueBillName};

        const bucket = createFsBucket();
        const uploadStream = bucket.openUploadStream(uniqueBillName);
        uploadStream.write(file.buffer);
        uploadStream.end((err) => {
        if (err) {
            console.error(err);
        } 
            console.log(`File ${uniqueBillName} uploaded successfully.`);
        });

        const shopDataValid = await shopValidationSchema.validateAsync(shopBody);

        selectedFbo.shopDetails.forEach((elem)=>{
            if(elem.address === shopDataValid.address){
                addressErr = true
            }
        })

        if(addressErr){
            return res.status(401).json({addressErr, messsage: 'This address already exists'});
        }

        const addedShopDetails = await fboModel.findByIdAndUpdate(objId, {$push: {"shopDetails": shopDataValid}}, {new: true});

        if(!addedShopDetails){
            success = false;
            return res.status(404).json({ success, message: 'Some error occured' });
        }

        success = true;
        return res.status(200).json({ success, message: 'Shop details added successfully' });

    } catch (error) {
        console.error(error)
        return res.status(500).json({message: "Internal Server Error"});
    }
}
