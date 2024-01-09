const generalDataSchema = require('../models/generalDataSchema');
const pincodesDataSchema = require('../models/pincodesDataSchema');

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

exports.getPincodesData = async(req, res)=>{ //for getting pincodes and their sates and districts
    try {
        const jsonData = require('../assets/pincodes.json')
        const filteredData=jsonData.filter((item) => item.StateName===req.params.stateName)
        res.setHeader('Content-Type','application/json');
        return res.status(200).json(filteredData);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}