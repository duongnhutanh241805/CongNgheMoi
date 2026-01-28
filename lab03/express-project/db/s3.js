require("dotenv").config();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'my-products-images';

module.exports = {
  async uploadImage(file) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `products/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/products/${fileName}`;
  },

  // Xóa ảnh từ S3
  async deleteImage(imageUrl) {
    if (!imageUrl) return;
    
    // Lấy key từ URL
    const key = imageUrl.split('.com/')[1];
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
  }
};
