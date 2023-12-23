const generalDataSchema = require('../models/generalDataSchema');

exports.employeeFormData = async(req, res)=>{
    try {
        const data = await generalDataSchema.find();
        return res.status(200).json(data[0].staff_data);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

exports.fboFormData = async(req, res)=>{
    try {
        const data = await generalDataSchema.find();
        return res.status(200).json(data[0].fbo_data);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}
// general data for product list and there price
 
exports.getProductData = async(req, res)=>{
    try {
        const data = await generalDataSchema.find();
        return res.status(200).json(data[0].products);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}
 
exports.getPostData = async(req, res)=>{
    try {
        const data = await generalDataSchema.find();
        return res.status(200).json(data[0].posts);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

