const express = require('express');
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .post(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.createCompany
  );
router
  .route('/')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.getCompany
  );
router
  .route('/user')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.getCompanyWithUser
  );
router
  .route('/')
  .put(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.updateCompany
  );
router
  .route('/')
  .delete(
    authMiddleware,
    roleMiddleware(['subadmin']),
    companyController.deleteCompany
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
