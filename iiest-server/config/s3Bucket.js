const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const AWS_S3 = JSON.parse(process.env.AWS_S3); 

const s3Client = new S3Client({
    region: AWS_S3.region,
    credentials: {
        accessKeyId: AWS_S3.accessKeyId,
        secretAccessKey: AWS_S3.secretAccessKey
    }
})

exports.getDocObject = async (key) => {

    try{
        const command = new GetObjectCommand({
            Bucket: AWS_S3.bucket,
            Key: key
        });
    
        const url = await getSignedUrl(s3Client, command);
        return url;
    } catch(error) {
        console.log(error);
    }
   
}

exports.uploadDocObject = async(key, contentType) => {
   try {
    
    // console.log(command);
    const command = new PutObjectCommand({
        Bucket: AWS_S3.bucket,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command);
    return(url);

   } catch(error) {
    console.log(error)
   }
}