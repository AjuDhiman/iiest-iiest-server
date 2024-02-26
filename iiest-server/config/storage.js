const multer = require('multer')


//configuration of diskstorage for fostac certificate
const fostacCertificate = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, 'documents/fostac'); // Destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_fostac_certificate.pdf');
  }
});

const fostacDocuments = multer({ storage: fostacCertificate });

const foscosDocumentsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, 'documents/foscos');
  },
  filename: function (req, file, cb) {
    cb(null, req.params.id + file.fieldname + '_shopPhoto.jpg');
  }
});

const foscosDocuments = multer({ storage: foscosDocumentsStorage });


module.exports = { fostacDocuments, foscosDocuments }

