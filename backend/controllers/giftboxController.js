const mongoose = require('mongoose');
const { GiftBox, Product } = require('../utils/modelUtil');

exports.createGiftBox = async (req, res) => {
  try {
    const newGiftBox = new GiftBox({
      ...req.body,
      companyId: req.user.companyId
    });
    const savedGiftBox = await newGiftBox.save();
    res
      .status(201)
      .json({ message: 'GiftBox created successfully!', data: savedGiftBox });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating GiftBox', error: error.message });
  }
};

exports.getAllGiftBoxes = async (req, res) => {
  try {
    const giftBoxes = await GiftBox.find({
      companyId: req.user.companyId
    }).populate({
      path: 'products.productId',
      model: Product,
      select: 'name price image stockavailable totalsales totalrevenue status'
    });

    // Transform the response to include product details in a consistent format
    const transformedGiftBoxes = giftBoxes.map((giftBox) => {
      const giftBoxObj = giftBox.toObject();
      if (giftBoxObj.products) {
        giftBoxObj.products = giftBoxObj.products.map((product) => ({
          _id: product.productId._id,
          productId: product.productId._id,
          name: product.productId.name,
          price: product.productId.price,
          image: product.productId.image,
          stockavailable: product.productId.stockavailable,
          totalsales: product.productId.totalsales,
          totalrevenue: product.productId.totalrevenue,
          status: product.productId.status,
          quantity: product.quantity
        }));
      }
      return giftBoxObj;
    });

    res.status(200).json(transformedGiftBoxes);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving GiftBoxes', error: error.message });
  }
};

exports.getGiftBoxById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'GiftBox ID is required!' });
    }

    const giftBox = await GiftBox.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    }).populate({
      path: 'products.productId',
      model: Product,
      select: 'name price image stockavailable totalsales totalrevenue status'
    });

    if (!giftBox) {
      return res.status(404).json({ message: 'GiftBox not found!' });
    }

    const giftBoxWithProducts = giftBox.products.map((product) => ({
      _id: product.productId._id,
      image: product.productId.image,
      name: product.productId.name,
      price: product.productId.price,
      stockavailable: product.productId.stockavailable,
      totalsales: product.productId.totalsales,
      totalrevenue: product.productId.totalrevenue,
      status: product.productId.status,
      quantity: product.quantity
    }));

    const response = {
      ...giftBox.toObject(),
      products: giftBoxWithProducts
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching GiftBox',
      error: error.message
    });
  }
};

exports.updateGiftBoxById = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.status(400).json({ message: 'GiftBox ID is required!' });
    }

    const updatedGiftBox = await GiftBox.findOneAndUpdate(
      {
        _id: req.body._id,
        companyId: req.user.companyId
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedGiftBox) {
      return res.status(404).json({ message: 'GiftBox not found!' });
    }

    res.status(200).json({
      message: 'GiftBox updated successfully!',
      data: updatedGiftBox
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating GiftBox',
      error: error.message
    });
  }
};

exports.getAllActiveGiftBox = async (req, res) => {
  try {
    const giftBoxes = await GiftBox.find({
      companyId: req.user.companyId,
      status: true
    });
    res.status(200).json(giftBoxes);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving GiftBoxes', error: error.message });
  }
};

exports.deleteGiftBoxById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'GiftBox ID is required!' });
    }

    const deletedGiftBox = await GiftBox.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!deletedGiftBox) {
      return res.status(404).json({ message: 'GiftBox not found!' });
    }

    res.status(200).json({
      message: 'GiftBox deleted successfully!',
      data: deletedGiftBox
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting GiftBox',
      error: error.message
    });
  }
};
