const express = require("express");
const router = express.Router();
const Treaty = require("../models/Treaty");
const Allocation = require("../models/Allocation");
const AuditLog = require("../models/AuditLog");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// List Treaties
router.get(
  "/",
  protect,
  authorizeRoles("REINSURANCE_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const treaties = await Treaty.find().sort({ createdAt: -1 });
      res.json(treaties);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create Treaty
router.post(
  "/",
  protect,
  authorizeRoles("REINSURANCE_MANAGER", "ADMIN"),
  async (req, res) => {
    try {
      const { treatyName, reinsurerName, sharePercentage, retentionLimit } = req.body;

      // Validation
      if (!treatyName || !reinsurerName || sharePercentage === undefined || !retentionLimit) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (sharePercentage < 0 || sharePercentage > 100) {
        return res.status(400).json({ message: "Share percentage must be between 0 and 100" });
      }

      if (retentionLimit < 0) {
        return res.status(400).json({ message: "Retention limit must be positive" });
      }

      const treaty = await Treaty.create({
        treatyName,
        reinsurerName,
        sharePercentage,
        retentionLimit,
      });

      await AuditLog.create({
        treatyId: treaty._id,
        action: "TREATY_CREATED",
        performedBy: req.user._id,
      });

      res.status(201).json(treaty);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get Treaty by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("REINSURANCE_MANAGER"),
  async (req, res) => {
    try {
      const treaty = await Treaty.findById(req.params.id);

      if (!treaty) {
        return res.status(404).json({ message: "Treaty not found" });
      }

      res.json(treaty);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete Treaty
router.delete(
  "/:id",
  protect,
  authorizeRoles("REINSURANCE_MANAGER"),
  async (req, res) => {
    try {
      const treaty = await Treaty.findByIdAndDelete(req.params.id);

      if (!treaty) {
        return res.status(404).json({ message: "Treaty not found" });
      }

      // Also remove associated allocations
      await Allocation.deleteMany({ treatyId: req.params.id });

      await AuditLog.create({
        treatyId: req.params.id,
        action: "TREATY_DELETED",
        performedBy: req.user._id,
      });

      res.json({ message: "Treaty deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;