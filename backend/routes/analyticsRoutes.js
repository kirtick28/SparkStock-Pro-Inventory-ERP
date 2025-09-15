const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Advanced analytics endpoint
router.get(
  '/advanced',
  authMiddleware,
  roleMiddleware(['subadmin', 'superadmin']),
  analyticsController.getAdvancedAnalytics
);

// Export analytics data
router.get(
  '/export',
  authMiddleware,
  roleMiddleware(['subadmin', 'superadmin']),
  analyticsController.exportAnalyticsData
);

// Real-time dashboard metrics
router.get(
  '/realtime',
  authMiddleware,
  roleMiddleware(['subadmin', 'superadmin']),
  analyticsController.getRealTimeDashboard
);

module.exports = router;
