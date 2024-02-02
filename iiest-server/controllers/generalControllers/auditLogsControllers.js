const auditLogsSchema = require('../../models/operationModels/auditLogSchema');

exports.logAudit = async(userId, candidateId, action) => {
   let log = await auditLogsSchema.create({operatorInfo:userId, recipientInfo:candidateId, action})
   return log;
}

exports.getAuditLogs = async(req, res) => {
    try {

        let success = false;

        const recipientId = req.params.recipientid;

        console.log(recipientId);

        const logs = await auditLogsSchema.find({recipientInfo: recipientId}).populate({path: 'operatorInfo'});

        if(logs){
            success=true;
            res.status(200).json({success, logs});
        } else{
            res.status(204);
        }
        
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}