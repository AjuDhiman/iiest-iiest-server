const { fostacDocuments } = require("../config/storage");

const uploadCertificateMiddleware = async (req, res, next) => {

    try {
        console.log(req.file);
        if (req.file) {
            fostacDocuments.single('certificate')(req, res, next);
        } else {
            next();
        }

    } catch (error) {
       
    }
}

module.exports = uploadCertificateMiddleware;