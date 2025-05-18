const { Company, User } = require('../utils/modelUtil');

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ admin: req.user.id });

    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    return res.status(200).json(company);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    return res.status(200).json(companies);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    let id;
    const updatedData = req.body;
    if (req.user.role === 'superadmin') {
      id = req.body.id;
      delete updatedData.id;
    } else {
      id = req.user.companyId;
    }
    if (updatedData.companyname) {
      updatedData.companyname = updatedData.companyname.trim();
    }
    const company = await Company.findOneAndUpdate({ _id: id }, updatedData, {
      new: true
    });
    const user = await User.findOne({ _id: company.admin });
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: {
        _id: company._id,
        companyname: company.companyname
      }
    };
    const token = generateToken(payload);

    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    return res
      .status(200)
      .json({ message: 'Company updated successfully.', company, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.user.companyId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.dropdownCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}, 'companyname _id');
    return res.status(200).json(companies);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};
