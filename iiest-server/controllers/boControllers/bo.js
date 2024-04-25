const boModel = require('../../models/BoModels/boSchema');
const { sendMailToBo } = require('./emailService');
const {generateUniqueId} = require('../../fbo/generateCredentials');

exports.createBusinessOwner = async (req, res) => {
    try {
        const { 
               owner_name, 
               business_entity, 
               business_category, 
               business_ownership_type, 
               contact_no, 
               email } = req.body;

               console.log(req.body);

       const {idNumber, generatedUniqueCustomerId} = await generateUniqueId();
       console.log(idNumber);

        const newBo = await boModel.create({employeeInfo: req.user._id, 
            id_num: idNumber, 
            customer_id: generatedUniqueCustomerId,
            owner_name, 
            business_entity, 
            business_category, 
            business_ownership_type, 
            contact_no, 
            email});

            await sendMailToBo(email, generatedUniqueCustomerId);

        res.status(201).json({ message: 'Business owner created successfully', data: newBo });
    } catch (error) {
        console.error('Error creating business owner:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllBusinessOwners = async (_req, res) => {
    try {
        const businessOwners = await boModel.find();
        console.log(businessOwners);
        res.status(200).json({ data: businessOwners });
    } catch (error) {
     
        console.error('Error fetching business owners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};







