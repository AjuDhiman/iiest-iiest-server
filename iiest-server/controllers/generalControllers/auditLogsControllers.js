const auditLogsSchema = require('../../models/operationModels/auditLogSchema');

exports.logAudit = async(userId, targetCollection , targetId, prevVal, currentVal, action) => {
   let log = await auditLogsSchema.create({operatorInfo:userId, targetCollection:targetCollection, targetInfo:targetId, prevVal: prevVal, currentVal: currentVal, action})
   return log;
}

exports.getAuditLogs = async(req, res) => {
    try {

        let success = false;

        const recipientId = req.params.recipientid;

        const logs = await auditLogsSchema.find({targetInfo: recipientId}).populate({path: 'operatorInfo'});

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