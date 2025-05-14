const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const productController = require('../controllers/productController');

const router = express.Router();

router
  .route('/add')
  .post(
    authMiddleware,
    roleMiddleware(['subadmin']),
    productController.addProduct
  );
router
  .route('/')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    productController.getAllProducts
  );
router
  .route('/single')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    productController.getProductById
  );
router
  .route('/update')
  .patch(
    authMiddleware,
    roleMiddleware(['subadmin']),
    productController.updateProduct
  );
router
  .route('/delete')
  .put(
    authMiddleware,
    roleMiddleware(['subadmin']),
    productController.deleteProduct
  );
router
  .route('/active')
  .get(
    authMiddleware,
    roleMiddleware(['subadmin']),
    productController.getActiveProducts
  );
router
  .route('/bulkadd')
  .post(
    authMiddleware,
    roleMiddleware(['subadmin']),
    upload.single('file'),
    productController.createBulkProducts
  );

module.exports = router;
