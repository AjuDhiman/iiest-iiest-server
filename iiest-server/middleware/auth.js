//Middleware for authorization and authentication

const jwt = require('jsonwebtoken');
const auth = JSON.parse(process.env.AUTH);
const JWT_SECRET = auth.JWT_TOKEN;
const employeeSchema = require('../models/employeeModels/employeeSchema')

const authMiddleware = async(req, res, next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: 'Please authenticate using a valid token'});
    }
    try {
        const data = jwt.verify(token,  JWT_SECRET);
        const userCheck = await employeeSchema.findById(data.user.id).select('-password');
        req.user = userCheck;
        if(userCheck){
           return next();
        }else{
            return res.status(401).json({userError: "User does not exist"})
        }
    } catch (error) {
            return res.status(401).json({error: 'Please authenticate using a valid token'});
    }
}

module.exports = authMiddleware;