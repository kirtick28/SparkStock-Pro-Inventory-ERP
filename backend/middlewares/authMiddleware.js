const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const JWT_SECRET = process.env.JWT_SECRET || 'abcdefg!@$$@%^&%sdds/ffg';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    if (decoded.role === 'subadmin') {
      const subAdmin = await User.findOne({
        email: decoded.email,
        role: 'subadmin'
      }).lean();

      if (!subAdmin) {
        return res.status(404).json({ message: 'Subadmin not found.' });
      }

      if (!subAdmin.status) {
        return res
          .status(400)
          .json({ message: 'Subadmin account is deactivated.' });
      }
    }
    next();
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Authentication failed.', error: error.message });
  }
};

module.exports = authMiddleware;
