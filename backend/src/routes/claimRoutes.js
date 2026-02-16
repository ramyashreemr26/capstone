const express = require("express");
const router = express.Router();
const {
  getAllClaims,
  createClaim,
  reviewClaim,
  approveClaim,
  rejectClaim,
  settleClaim,
} = require("../controllers/claimController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Get All Claims
router.get("/", protect, getAllClaims);

router.post("/", protect, authorizeRoles("CLAIMS_ADJUSTER"), createClaim);
router.put("/:id/review", protect, authorizeRoles("CLAIMS_ADJUSTER"), reviewClaim);
router.put("/:id/approve", protect, authorizeRoles("CLAIMS_ADJUSTER"), approveClaim);
router.put("/:id/reject", protect, authorizeRoles("CLAIMS_ADJUSTER"), rejectClaim);
router.put("/:id/settle", protect, authorizeRoles("CLAIMS_ADJUSTER"), settleClaim);

module.exports = router;