const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'documents/fostac'); // Destination folder for storing uploaded files
    },
    filename: function (req, file, cb) {
      cb(null, req.params.recipientid + 'fostac_certificate.pdf');
    }
  });
  
  const fostacDocuments = multer({ storage: storage });

module.exports = { fostacDocuments };