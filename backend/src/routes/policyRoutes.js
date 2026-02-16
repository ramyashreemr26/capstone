const express = require("express");
const router = express.Router();
const { createPolicy, submitForApproval, approvePolicy, getPolicy, getAllPolicies, getPolicyAuditLogs } = require("../controllers/policyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Get All Policies
router.get(
    "/",
    protect,
    getAllPolicies
);

// Only UNDERWRITER can create
router.post(
    "/",
    protect,
    authorizeRoles("UNDERWRITER"),
    createPolicy
);

router.put(
    "/:id/submit",
    protect,
    authorizeRoles("UNDERWRITER"),
    submitForApproval
);

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("ADMIN"),
  approvePolicy
);

router.get("/:id", protect, getPolicy);

router.get(
  "/:id/audit",
  protect,
  authorizeRoles("ADMIN"),
  getPolicyAuditLogs
);

module.exports = router;