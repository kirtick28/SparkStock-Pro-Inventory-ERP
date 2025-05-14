const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Company'
  },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: {
    type: String,
    required: true
  },
  orders: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }
  ],
  status: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = customerSchema;
