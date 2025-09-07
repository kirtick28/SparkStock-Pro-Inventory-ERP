const express = require('express');
const router = express.Router();

const {
  createGiftBox,
  getAllGiftBoxes,
  updateGiftBoxById,
  getGiftBoxById,
  getAllActiveGiftBox,
  deleteGiftBoxById
} = require('../controllers/giftboxController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['subadmin']), createGiftBox);
router.get('/', authMiddleware, roleMiddleware(['subadmin']), getAllGiftBoxes);
router.get(
  '/single/:id',
  authMiddleware,
  roleMiddleware(['subadmin']),
  getGiftBoxById
);
router.put(
  '/',
  authMiddleware,
  roleMiddleware(['subadmin']),
  updateGiftBoxById
);
router.get(
  '/active',
  authMiddleware,
  roleMiddleware(['subadmin']),
  getAllActiveGiftBox
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['subadmin']),
  deleteGiftBoxById
);

module.exports = router;
