const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyname: {
    type: String,
    required: true
  },
  companytagline: {
    type: String,
    required: true
  },
  personcontact: {
    type: String,
    required: true
  },
  shopaddress: {
    type: String,
    required: true
  },
  paymentterms: {
    type: String,
    required: true,
    default: 'Due upon receipt'
  },
  jobdescription: {
    type: String,
    required: true
  },
  bankdetails: {
    accountname: {
      type: String,
      required: true
    },
    accountno: {
      type: Number,
      required: true
    },
    accounttype: {
      type: String,
      required: true
    },
    bankname: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      required: true
    },
    ifsc: {
      type: String,
      required: true
    }
  },
  createdat: {
    type: Date,
    default: Date.now
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  status: {
    type: Boolean,
    default: true
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: Number
  },
  gstNumber: {
    type: String
  },
  logo: {
    type: String
  }
});

module.exports = companySchema;
