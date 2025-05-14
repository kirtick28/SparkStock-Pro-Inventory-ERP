const mongoose = require('mongoose');
const orderSchema = require('../models/Order');
const customerSchema = require('../models/Customer');
const productSchema = require('../models/Product');
const companySchema = require('../models/Company');
const giftBoxSchema = require('../models/GiftBox');
const userSchema = require('../models/User');
const cartSchema = require('../models/Cart');

const Order = mongoose.model('Order', orderSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Product = mongoose.model('Product', productSchema);
const Company = mongoose.model('Company', companySchema);
const GiftBox = mongoose.model('GiftBox', giftBoxSchema);
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);

module.exports = {
  Order,
  Customer,
  Product,
  Company,
  GiftBox,
  User,
  Cart
};
