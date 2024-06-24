const multer = require('multer')


//configuration of diskstorage for fostac certificate
const ticketStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destination;
    if(req.body.ticketType == 'Fostac Cerificate') {
      destination = 'documents/fostac';
    } else if(req.body.ticketType == 'Foscos License') {
      destination = 'documents/foscos';
    } else if(req.body.ticketType == 'Audit Report') {
      destination = 'documents/hra';
    }
    cb(null, destination); // Destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '.' + getExtention(file.originalname));
  }
});

const tickets = multer({ storage: ticketStorage });

const foscosDocumentsStorage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, 'documents/foscos');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' + file.fieldname + '.' + getExtention(file.originalname));
  }
});

const foscosDocuments = multer({ storage: foscosDocumentsStorage });


const fostacDocumentsStorage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, 'documents/fostac');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' + file.fieldname + '.' + getExtention(file.originalname));
  }
});

const fostacDocuments = multer({ storage: fostacDocumentsStorage });

const chequeImageStorage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, 'documents/cheques');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' + file.fieldname + '.' + getExtention(file.originalname));
  }
});

const chequeImage = multer({ storage: chequeImageStorage });

const hraDocumentsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'documents/hra');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' + file.fieldname + '.' + getExtention(file.originalname));
  }
});

const hraDocuments = multer({ storage: hraDocumentsStorage });

function getExtention(fileName){
  const ext = fileName.toString().split('.').pop();
  return ext
}

module.exports = { tickets, foscosDocuments, hraDocuments, chequeImage, fostacDocuments }

