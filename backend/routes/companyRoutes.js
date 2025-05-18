const express = require('express');
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.getCompany
  );
router
  .route('/')
  .put(
    authMiddleware,
    roleMiddleware(['subadmin', 'superadmin']),
    companyController.updateCompany
  );
router
  .route('/details')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.getCompanyDetails
  );

router
  .route('/dropdown')
  .get(
    authMiddleware,
    roleMiddleware(['superadmin']),
    companyController.dropdownCompanies
  );

module.exports = router;
