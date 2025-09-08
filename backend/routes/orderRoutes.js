const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router
  .route('/place-order')
  .post(
    authMiddleware,
    roleMiddleware(['subadmin']),
    orderController.placeOrder
  );

router
  .route('/stats')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    orderController.getDashboardStats
  );

router
  .route('/all')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    orderController.getAllOrders
  );

router
  .route('/monthly-orders')
  .post(
    authMiddleware,
    roleMiddleware(['subadmin']),
    orderController.getOrdersByMonth
  );

module.exports = router;
