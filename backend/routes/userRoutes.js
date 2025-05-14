const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Create a new subadmin
router
  .route('/create-subadmin')
  .post(
    authMiddleware,
    roleMiddleware(['superadmin']),
    userController.createSubAdmin
  );

// Get all subadmins
router
  .route('/sub-admins')
  .get(
    authMiddleware,
    roleMiddleware(['superadmin']),
    userController.getAllSubAdmins
  );

// Update a subadmin
router
  .route('/update-subadmin')
  .put(
    authMiddleware,
    roleMiddleware(['superadmin', 'subadmin']),
    userController.updateSubAdmin
  );

// Update a Super Admin
router
  .route('/')
  .put(
    authMiddleware,
    roleMiddleware(['superadmin']),
    userController.updateSuperAdmin
  );

// Get user profile
router
  .route('/profile')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin', 'superadmin']),
    userController.getUserProfile
  );

module.exports = router;
