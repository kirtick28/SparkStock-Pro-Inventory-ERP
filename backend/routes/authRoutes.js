const express = require('express');
const authController = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const validateSignup = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];

// Signup route with validation
router.route('/signup').post(validateSignup, authController.signup);

// Login route with validation
router.route('/login').post(validateLogin, authController.login);

module.exports = router;
