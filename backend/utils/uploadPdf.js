const cloudinary = require('cloudinary').v2;
const moment = require('moment');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkro770eh',
  api_key: process.env.CLOUDINARY_API_KEY || '588145723158891',
  api_secret: process.env.CLOUDINARY_API_SECRET || '2FVYifC8e3kwiNb_Ui96ZfEEfsc'
});

const uploadPDFToCloudinary = async (filePath, companyName, customerName) => {
  try {
    const currentDateTime = moment().format('YYYY-MM-DD_HH-mm-ss');
    const customFileName = `${customerName}_${currentDateTime}`;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: `${companyName}`,
      public_id: customFileName
    });

    console.log('File uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

module.exports = { uploadPDFToCloudinary };
