const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { saveCart, getPendingCart } = require('../controllers/cartController');

router
  .route('/save')
  .post(authMiddleware, roleMiddleware(['subadmin']), saveCart);
router
  .route('/pending/:id')
  .get(authMiddleware, roleMiddleware(['subadmin']), getPendingCart);

module.exports = router;
