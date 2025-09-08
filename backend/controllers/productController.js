const XLSX = require('xlsx');
const emojis = ['🎆', '🧨', '🎁', '🚀', '🎇', '🎉', '💥', '✨', '🎄', '🎃'];
const { Product, Company } = require('../utils/modelUtil'); // Added Company

exports.addProduct = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const { name, ...otherProductData } = req.body;
    const companyId = req.user.companyId;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    const lowerCaseName = name.toLowerCase();
    const existingProduct = await Product.findOne({
      companyId: companyId,
      name: { $regex: new RegExp(`^${lowerCaseName}$`, 'i') }
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'Product name already taken' });
    }

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const productData = {
      name,
      ...otherProductData,
      image: randomEmoji,
      companyId: companyId
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    res
      .status(201)
      .json({ message: 'Product added successfully', product: savedProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res
      .status(500)
      .json({ message: 'Error adding product', error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const products = await Product.find({ companyId: req.user.companyId });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res
      .status(500)
      .json({ message: 'Error fetching products', error: error.message });
  }
};

exports.getActiveProducts = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const products = await Product.find({
      companyId: req.user.companyId,
      status: true
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res
      .status(500)
      .json({ message: 'Error fetching products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ message: 'Product ID missing' });
    }

    const product = await Product.findOne({
      _id: req.body.id,
      companyId: req.user.companyId,
      status: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res
      .status(500)
      .json({ message: 'Error fetching product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const { _id, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'Product ID required' });
    }

    const product = await Product.findOne({
      _id,
      companyId: req.user.companyId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.status && !updateData.status) {
      return res.status(400).json({ message: 'Product is inactive' });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id, companyId: req.user.companyId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({ message: 'Update failed' });
    }

    res.status(200).json({
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res
      .status(500)
      .json({ message: 'Error updating product.', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    if (!req.body.id) {
      return res.status(400).json({ message: 'Product ID missing' });
    }

    const product = await Product.findOne({
      _id: req.body.id,
      companyId: req.user.companyId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.status) {
      return res.status(400).json({ message: 'Already deleted' });
    }

    product.status = false;
    const updatedProduct = await product.save();

    res.status(200).json({
      message: 'Product deleted successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res
      .status(500)
      .json({ message: 'Error deleting product', error: error.message });
  }
};

exports.createBulkProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Check company status
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message:
          'Invalid file type. Please upload an Excel file (.xlsx or .xls)'
      });
    }

    // Parse Excel file
    let workbook, sheet, productsData;
    try {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({ message: 'Excel file has no sheets' });
      }
      sheet = workbook.Sheets[workbook.SheetNames[0]];
      productsData = XLSX.utils.sheet_to_json(sheet);
    } catch (parseError) {
      console.error('Excel parsing error:', parseError);
      return res.status(400).json({
        message:
          'Invalid Excel file format. Please check your file and try again.'
      });
    }

    if (!productsData || productsData.length === 0) {
      return res.status(400).json({
        message: 'Excel file is empty or has no data rows'
      });
    }

    // Validate and process products
    const validProducts = [];
    const errors = [];
    const companyId = req.user.companyId;

    for (let i = 0; i < productsData.length; i++) {
      try {
        const row = productsData[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we skip header

        // Normalize column names (case insensitive)
        const normalizedRow = Object.keys(row).reduce((acc, key) => {
          acc[key.toLowerCase().trim()] = row[key];
          return acc;
        }, {});

        const { name, price, stockavailable } = normalizedRow;

        // Validate required fields
        if (!name || name.toString().trim() === '') {
          errors.push(`Row ${rowNumber}: Product name is required`);
          continue;
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
          errors.push(
            `Row ${rowNumber}: Valid price is required (must be a positive number)`
          );
          continue;
        }

        if (
          !stockavailable ||
          isNaN(parseInt(stockavailable)) ||
          parseInt(stockavailable) < 0
        ) {
          errors.push(
            `Row ${rowNumber}: Valid stock quantity is required (must be a non-negative number)`
          );
          continue;
        }

        const productName = name.toString().trim();
        const productPrice = parseFloat(price);
        const productStock = parseInt(stockavailable);

        // Check for duplicate names in the same upload
        const duplicateInUpload = validProducts.find(
          (p) => p.name.toLowerCase() === productName.toLowerCase()
        );
        if (duplicateInUpload) {
          errors.push(
            `Row ${rowNumber}: Duplicate product name "${productName}" in upload`
          );
          continue;
        }

        // Check if product already exists in database
        const existingProduct = await Product.findOne({
          companyId: companyId,
          name: { $regex: new RegExp(`^${productName}$`, 'i') }
        });

        if (existingProduct) {
          errors.push(
            `Row ${rowNumber}: Product "${productName}" already exists`
          );
          continue;
        }

        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        validProducts.push({
          companyId: companyId,
          image: randomEmoji,
          name: productName,
          price: productPrice,
          stockavailable: productStock
        });
      } catch (rowError) {
        errors.push(`Row ${i + 2}: ${rowError.message}`);
      }
    }

    // If there are errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation errors found in Excel file',
        errors: errors,
        validProductsCount: validProducts.length,
        totalRows: productsData.length
      });
    }

    // If no valid products, return error
    if (validProducts.length === 0) {
      return res.status(400).json({
        message: 'No valid products found in Excel file'
      });
    }

    // Insert products in bulk
    const createdProducts = await Product.insertMany(validProducts);

    res.status(201).json({
      message: `Successfully imported ${createdProducts.length} products`,
      products: createdProducts,
      totalProcessed: productsData.length,
      successCount: createdProducts.length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Error creating bulk products:', error);
    res.status(500).json({
      message: 'Error processing Excel file',
      error: error.message
    });
  }
};
