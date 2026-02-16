const express = require("express");
const router = express.Router();

const {
  policyDashboard,
  claimsDashboard,
  reinsuranceDashboard,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

router.get("/policies", protect, policyDashboard);
router.get("/claims", protect, claimsDashboard);
router.get("/reinsurance", protect, reinsuranceDashboard);

module.exports = router;