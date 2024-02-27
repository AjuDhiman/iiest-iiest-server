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
    cb(null, 'documents/foscos');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' + file.fieldname + '.jpg');
  }
});

const foscosDocuments = multer({ storage: foscosDocumentsStorage });

function getExtention(fileName){
  let ext = [];
  for(let i = fileName.length - 1; i >= 0; i--) {
    ext.unshift(fileName[i]);
    if(fileName[i] === '.'){
      break;
    }
  }

  ext = ext.join('');
  return ext
}

module.exports = { fostacDocuments, foscosDocuments }

