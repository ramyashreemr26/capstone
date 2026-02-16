const express = require("express");
const router = express.Router();
const Allocation = require("../models/Allocation");
const { protect } = require("../middleware/authMiddleware");

// Get Allocations by Policy ID
router.get("/policy/:policyId", protect, async (req, res) => {
  try {
    const allocations = await Allocation.find({ policyId: req.params.policyId })
      .populate("treatyId", "treatyName reinsurerName sharePercentage")
      .populate("policyId", "policyNumber insuredName coverageAmount");

    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Allocations (with pagination)
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allocations = await Allocation.find()
      .populate("treatyId", "treatyName reinsurerName sharePercentage")
      .populate("policyId", "policyNumber insuredName coverageAmount status")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Allocation.countDocuments();

    res.json({
      allocations,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
