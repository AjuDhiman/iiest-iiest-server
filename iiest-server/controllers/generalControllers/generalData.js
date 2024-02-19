const generalDataSchema = require('../../models/generalModels/generalDataSchema');

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

exports.getPincodesData = async(req, res)=>{
    try {
        const jsonData = require('../../assets/pincodes.json')
        const filteredData = jsonData.filter((item) => item.State===req.params.stateName);
        res.setHeader('Content-Type','application/json');
        return res.status(200).json(filteredData);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

exports.getKobData = async(req, res) => {
    try{
        const data = await generalDataSchema.find();
        return res.status(200).json(data[0].kob);
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
} 