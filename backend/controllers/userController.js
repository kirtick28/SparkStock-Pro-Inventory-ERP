const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Company } = require('../utils/modelUtil');
const generateToken = require('../utils/generateToken');

exports.createSubAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      useExistingCompany,
      companyId,
      companyName,
      companyTagline,
      personContact,
      shopAddress,
      jobDescription,
      bankDetails
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let company;

    if (useExistingCompany && companyId) {
      company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found.' });
      }
    } else {
      company = new Company({
        companyname: companyName,
        companytagline: companyTagline,
        personcontact: personContact,
        shopaddress: shopAddress,
        jobdescription: jobDescription,
        bankdetails: {
          accountname: bankDetails.accountname,
          accountno: bankDetails.accountno,
          accounttype: bankDetails.accounttype,
          bankname: bankDetails.bankname,
          branch: bankDetails.branch,
          ifsc: bankDetails.ifsc
        },
        admin: null // Will be set after subAdmin is created
      });
      await company.save();
    }

    const subAdmin = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: 'subadmin',
      createdby: req.user.id,
      companyId: company._id
    });

    await subAdmin.save();

    // If a new company was created, link its admin to the new subAdmin
    if (!useExistingCompany) {
      company.admin = subAdmin._id;
      await company.save();
    }

    // Populate company details for the response
    const populatedSubAdmin = await User.findById(subAdmin._id).populate('companyId');


    return res.status(200).json({
      message: 'Sub-admin created successfully.',
      subAdmin: {
        _id: populatedSubAdmin._id,
        name: populatedSubAdmin.name,
        email: populatedSubAdmin.email,
        phoneNumber: populatedSubAdmin.phoneNumber,
        status: populatedSubAdmin.status, // User status
        companyId: populatedSubAdmin.companyId ? { // Check if companyId exists
          _id: populatedSubAdmin.companyId._id,
          companyname: populatedSubAdmin.companyId.companyname,
          status: populatedSubAdmin.companyId.status // Company status
        } : null
      }
    });
  } catch (error) {
    // If company creation failed and subAdmin was created, attempt to remove subAdmin
    if (error.message.includes('Company validation failed') && subAdmin && subAdmin._id) {
        await User.findByIdAndDelete(subAdmin._id);
    }
    // If subAdmin creation failed and new company was created, attempt to remove company
    if (error.message.includes('User validation failed') && company && company._id && !useExistingCompany) {
        await Company.findByIdAndDelete(company._id);
    }
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' });
    }

    if (user.role === 'subadmin') {
      if (!user.status) {
        return res.status(400).json({ message: 'Account is deactivated.' });
      }

      const populatedUser = await User.findById(user._id).populate(
        'companyId',
        'companyname status'
      );
      if (!populatedUser.companyId || !populatedUser.companyId.status) {
        return res.status(400).json({ message: 'Company is deactivated.' });
      }
      user.companyId = populatedUser.companyId;
    }
    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        email: user.email,
        role: user.role,
        companyName: user.role === 'subadmin' ? user.companyId.name : null
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super admin already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin'
    });

    await superAdmin.save();

    return res
      .status(200)
      .json({ message: 'Super admin created successfully.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

// Removed login and signup functions

exports.getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await User.find({
      role: 'subadmin',
      createdby: req.user.id
    })
      .select('-password')
      .populate('companyId'); // Populate company details

    return res.status(200).json(subAdmins);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { status, name, email, password, phoneNumber, companyStatus } =
      req.body;
    let id;

    if (req.user.role === 'superadmin') {
      if (!req.body.id) {
        return res
          .status(400)
          .json({ message: 'Sub-admin ID is required for superadmin updates.' });
      }
      id = req.body.id;
    } else if (req.user.role === 'subadmin') {
      id = req.user.id; // Sub-admin can only update themselves
    } else {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Handle user updates
    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;
    if (password) {
      userToUpdate.password = await bcrypt.hash(password, 10);
    }
    if (typeof status === 'boolean') {
      userToUpdate.status = status;
    }

    await userToUpdate.save();

    // Handle company status update if applicable (only by superadmin)
    if (req.user.role === 'superadmin' && typeof companyStatus === 'boolean' && userToUpdate.companyId) {
      const company = await Company.findById(userToUpdate.companyId);
      if (company) {
        company.status = companyStatus;
        await company.save();
      }
    }
    
    const populatedUser = await User.findById(id).select('-password').populate('companyId');


    return res.status(200).json({
      message: 'User updated successfully.',
      subAdmin: populatedUser // Send back the updated user details
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.updateSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    const userId = req.user.id; // Superadmin updates themselves

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate || userToUpdate.role !== 'superadmin') {
      return res.status(404).json({ message: 'Superadmin not found.' });
    }

    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;
    if (password) {
      userToUpdate.password = await bcrypt.hash(password, 10);
    }

    await userToUpdate.save();
    const token = generateToken(userToUpdate); // Generate new token if sensitive info changed

    return res.status(200).json({
      message: 'Superadmin profile updated successfully.',
      token, // Send new token
      user: { // Send updated user info
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        phoneNumber: userToUpdate.phoneNumber
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('companyId');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error.', error: error.message });
  }
};
