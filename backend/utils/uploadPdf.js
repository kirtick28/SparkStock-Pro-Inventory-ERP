const cloudinary = require('cloudinary').v2;
const moment = require('moment');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkro770eh',
  api_key: process.env.CLOUDINARY_API_KEY || '588145723158891',
  api_secret: process.env.CLOUDINARY_API_SECRET || '2FVYifC8e3kwiNb_Ui96ZfEEfsc'
});

const uploadPDFToCloudinary = async (filePath, companyName, customerName) => {
  const startTime = Date.now();
  console.log('Starting Cloudinary upload...');

  try {
    const currentDateTime = moment().format('YYYY-MM-DD_HH-mm-ss');
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const customFileName = `${sanitizedCustomerName}_${currentDateTime}`;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: `${companyName}/invoices`,
      public_id: customFileName,
      timeout: 20000, // Reduced timeout
      chunk_size: 8000000, // Increased chunk size
      use_filename: false,
      unique_filename: true,
      eager_async: true, // Process in background
      invalidate: true // Invalidate CDN cache
    });

    console.log(
      `File uploaded successfully in ${Date.now() - startTime}ms:`,
      result.secure_url
    );
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading file:', error.message);

    // Single retry with simplified options
    try {
      console.log('Retrying upload with simplified options...');
      const currentDateTime = moment().format('YYYY-MM-DD_HH-mm-ss');
      const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
      const customFileName = `${sanitizedCustomerName}_${currentDateTime}_retry`;

      const retryResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        folder: `${companyName}/invoices`,
        public_id: customFileName,
        timeout: 15000,
        use_filename: false,
        unique_filename: true
      });

      console.log(
        `File uploaded successfully on retry in ${Date.now() - startTime}ms:`,
        retryResult.secure_url
      );
      return retryResult.secure_url;
    } catch (retryError) {
      console.error('Retry upload also failed:', retryError.message);

      // Return a fallback message or throw with more context
      throw new Error(
        `Cloudinary upload failed after retry: ${retryError.message}`
      );
    }
  }
};

module.exports = { uploadPDFToCloudinary };
