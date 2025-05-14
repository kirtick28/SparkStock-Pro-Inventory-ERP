const bcrypt = require('bcrypt');
const { User } = require('../utils/modelUtil');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Defensive check (optional)
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // Find user securely
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

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
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.role === 'subadmin' ? user.companyId._id : null,
        companyName:
          user.role === 'subadmin' ? user.companyId.companyname : null
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
