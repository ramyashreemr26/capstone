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

// UNDERWRITER or ADMIN can create
router.post(
    "/",
    protect,
    authorizeRoles("UNDERWRITER", "ADMIN"),
    createPolicy
);

router.put(
    "/:id/submit",
    protect,
    authorizeRoles("UNDERWRITER", "ADMIN"),
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
  getPolicyAuditLogs
);

module.exports = router;