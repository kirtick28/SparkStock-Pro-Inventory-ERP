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
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const customFileName = `${sanitizedCustomerName}_${currentDateTime}`;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: `${companyName}/invoices`,
      public_id: customFileName,
      timeout: 30000, // 30 second timeout
      chunk_size: 6000000, // 6MB chunks for faster upload
      use_filename: false,
      unique_filename: true
    });

    console.log('File uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading file:', error);

    // Retry once on failure
    try {
      console.log('Retrying upload...');
      const currentDateTime = moment().format('YYYY-MM-DD_HH-mm-ss');
      const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
      const customFileName = `${sanitizedCustomerName}_${currentDateTime}_retry`;

      const retryResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        folder: `${companyName}/invoices`,
        public_id: customFileName,
        timeout: 20000,
        use_filename: false,
        unique_filename: true
      });

      console.log(
        'File uploaded successfully on retry:',
        retryResult.secure_url
      );
      return retryResult.secure_url;
    } catch (retryError) {
      console.error('Retry upload also failed:', retryError);
      throw retryError;
    }
  }
};

module.exports = { uploadPDFToCloudinary };
