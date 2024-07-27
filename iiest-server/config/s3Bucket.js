const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// const multerS3 = require('multer-s3')
const AWS_S3 = JSON.parse(process.env.AWS_S3);
// const multer = require('multer')
// const multerS3 = require('multer-s')


//Destination Variables or path varibles  of the folders in bucket
const invoicePath = 'invoices/';
const employeeDocsPath = 'employee/';
const fboBasicDocsPath = 'basicsalesdoc/';
exports.invoicesPath = invoicePath;
exports.employeeDocsPath = employeeDocsPath;
exports.fboBasicDocsPath = fboBasicDocsPath;

//configuring S3 Client
const s3Client = new S3Client({
    region: AWS_S3.region,
    credentials: {
        accessKeyId: AWS_S3.accessKeyId,
        secretAccessKey: AWS_S3.secretAccessKey
    }
})

//methord for generating presigned get URL
exports.getDocObject = async (key) => {

    try {
        const command = new GetObjectCommand({
            Bucket: AWS_S3.bucket,
            Key: key
        });

        const url = await getSignedUrl(s3Client, command);
        return url;
    } catch (error) {
        console.log(error);
    }

}

//methord for deleting object from s3
exports.deleteDocObject = async (key) => {
  try {
      const command = new DeleteObjectCommand({
          Bucket: AWS_S3.bucket,
          Key: key
      });

      const response = await s3Client.send(command);
      console.log('Successfully deleted:', key);
      return response;
  } catch (error) {
      console.error('Error deleting object:', error);
  }
};

//methord for generating presigned put URL
exports.uploadDocObject = async (key, contentType) => {
    try {

        // console.log(command);
        const command = new PutObjectCommand({
            Bucket: AWS_S3.bucket,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3Client, command);
        return (url);

    } catch (error) {
        console.log(error)
    }
}

exports.uploadBuffer = async (key, buffer) => {
    const uploadParams = {
        Bucket: AWS_S3.bucket,
        Key: key,
        Body: buffer,
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        // return data;
        console.log("Buffer uploaded successfully:", data);
    } catch (err) {
        console.error("Error uploading buffer:", err);
    }
}


// //multer s3 uploading
// exports.signUpload = multer({
//     storage: multerS3({
//       s3: s3Client,
//       bucket: AWS_S3.bucket,
//       metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//       },
//       key: function (req, file, cb) {
//         cb(null, `employee/${(Date.now().toString() + '-' + file.originalname)}`);
//       }
//     })
//   });

//   exports.uploadFostacDoc = multer({
//     storage: multerS3({
//       s3: s3Client,
//       bucket: AWS_S3.bucket,
//       metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//       },
//       key: function (req, file, cb) {
//         cb(null, `employee/${(Date.now().toString() + '-' + file.originalname)}`);
//       }
//     })
//   });
