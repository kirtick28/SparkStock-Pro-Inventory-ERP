const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

generateToken = (user) => {
  const tokenPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.role === 'subadmin' ? user.companyId._id : null,
    companyName: user.role === 'subadmin' ? user.companyId.companyname : null
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  return token;
};

module.exports = generateToken;
