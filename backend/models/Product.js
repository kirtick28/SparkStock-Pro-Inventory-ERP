const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Company'
  },
  image: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stockavailable: {
    type: Number,
    required: true
  },
  totalsales: {
    type: Number,
    default: 0
  },
  totalrevenue: {
    type: Number,
    default: 0.0
  },
  status: {
    type: Boolean,
    default: true
  }
});

productSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = productSchema;
