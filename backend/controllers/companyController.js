const { Company, User } = require('../utils/modelUtil');

exports.createCompany = async (req, res) => {
  try {
    const {
      companyname,
      companytagline,
      personcontact,
      shopaddress,
      paymentterms,
      jobdescription,
      accountname,
      accountno,
      accounttype,
      bankname,
      branch,
      ifsc
    } = req.body;

    const company = new Company({
      companyname,
      companytagline,
      personcontact,
      shopaddress,
      paymentterms,
      jobdescription,
      bankdetails: {
        accountname,
        accountno,
        accounttype,
        bankname,
        branch,
        ifsc
      },
      admin: req.user.id
    });

    await company.save();

    return res
      .status(200)
      .json({ message: 'Company created successfully.', company });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

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
    const updatedData = req.body;
    if (updatedData.companyname) {
      updatedData.companyname = updatedData.companyname.trim();
    }
    const company = await Company.findOneAndUpdate(
      { admin: req.user.id },
      updatedData,
      { new: true }
    );
    const user = await User.findOne({ _id: req.user.id });
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

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ admin: req.user.id });

    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    return res.status(200).json({ message: 'Company deleted successfully.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.getCompanyWithUser = async (req, res) => {
  try {
    const company = await Company.findOne({ admin: req.user.id }).populate({
      path: 'admin',
      select: 'name email'
    });

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