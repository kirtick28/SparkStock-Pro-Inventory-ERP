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
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const productsData = XLSX.utils.sheet_to_json(sheet);

    const products = productsData.map((row) => {
      const normalizedRow = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase()] = row[key];
        return acc;
      }, {});

      const { name, price, stockavailable } = normalizedRow;

      if (!name || !price || !stockavailable) {
        throw new Error('Missing required fields in Excel file');
      }

      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      return {
        companyId: req.user.companyId,
        image: randomEmoji,
        name,
        price,
        stockavailable
      };
    });

    const createdProducts = await Product.insertMany(products);

    res.status(201).json({
      message: 'Products created successfully',
      products: createdProducts
    });
  } catch (error) {
    console.error('Error creating bulk products:', error);
    const errorMessage =
      error.message === 'Missing required fields in Excel file'
        ? error.message
        : 'Error creating bulk products';
    res.status(500).json({ message: errorMessage, error: error.message });
  }
};
