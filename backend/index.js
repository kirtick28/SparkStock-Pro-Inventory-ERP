const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
morgan.token('time12', () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: true });
});

app.use(
  morgan(
    ':time12 :method :url :status :response-time ms - :res[content-length]'
  )
);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes')); // Added auth routes
app.use('/api/user', require('./routes/userRoutes')); // Changed from /userAuth to /user
app.use('/api/product', require('./routes/productRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/order', require('./routes/orderRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/giftbox', require('./routes/giftboxRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Running on port', PORT);
});

const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connected sucessfully');
  })
  .catch((err) => {
    console.error('DB connection error:', err.message);
  });
