const Policy = require("../models/Policy");
const Claim = require("../models/Claim");
const Allocation = require("../models/Allocation");

// ==============================
// POLICY DASHBOARD
// ==============================
const policyDashboard = async (req, res) => {
  try {
    const totalPolicies = await Policy.countDocuments();

    const activePolicies = await Policy.countDocuments({
      status: "ACTIVE",
    });

    const policies = await Policy.find({ status: "ACTIVE" });

    let totalExposure = 0;

    policies.forEach((p) => {
      totalExposure += p.coverageAmount - p.retentionLimit;
    });

    res.json({
      totalPolicies,
      activePolicies,
      totalExposure,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// CLAIMS DASHBOARD
// ==============================
const claimsDashboard = async (req, res) => {
  try {
    const totalClaims = await Claim.countDocuments();

    const approvedClaims = await Claim.countDocuments({
      status: "APPROVED",
    });

    const settledClaims = await Claim.countDocuments({
      status: "SETTLED",
    });

    const totalClaimAmount = await Claim.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$claimAmount" },
        },
      },
    ]);

    res.json({
      totalClaims,
      approvedClaims,
      settledClaims,
      totalClaimAmount: totalClaimAmount[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// REINSURANCE DASHBOARD
// ==============================
const reinsuranceDashboard = async (req, res) => {
  try {
    const totalCeded = await Allocation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$cededAmount" },
        },
      },
    ]);

    const totalRetained = await Allocation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$retainedAmount" },
        },
      },
    ]);

    res.json({
      totalCeded: totalCeded[0]?.total || 0,
      totalRetained: totalRetained[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  policyDashboard,
  claimsDashboard,
  reinsuranceDashboard,
};