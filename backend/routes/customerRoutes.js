const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router
  .route('/')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    customerController.getAllCustomers
  );
router
  .route('/single')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    customerController.getCustomer
  );
router
  .route('/add')
  .post(
    authMiddleware,
    roleMiddleware(['subadmin']),
    customerController.createCustomer
  );
router
  .route('/')
  .put(
    authMiddleware,
    roleMiddleware(['subadmin']),
    customerController.updateCustomer
  );
router
  .route('/history')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    customerController.getCustomerHistory
  );

module.exports = router;
