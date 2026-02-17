const Policy = require("../models/Policy");
const Claim = require("../models/Claim");
const Allocation = require("../models/Allocation");
const Treaty = require("../models/Treaty");

// Helper function to calculate metrics from date filter
const getDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) {
    filter.$gte = new Date(startDate);
  }
  if (endDate) {
    if (!filter.$gte) {
      filter.$lte = new Date(endDate);
    } else {
      filter.$gte = new Date(startDate);
      filter.$lte = new Date(endDate);
    }
  }
  return Object.keys(filter).length > 0 ? { createdAt: filter } : {};
};

// ==============================
// POLICY DASHBOARD
// ==============================
const policyDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = getDateFilter(startDate, endDate);

    // Policy counts by status
    const totalPolicies = await Policy.countDocuments(dateFilter);
    const draftPolicies = await Policy.countDocuments({
      ...dateFilter,
      status: "DRAFT",
    });
    const pendingPolicies = await Policy.countDocuments({
      ...dateFilter,
      status: "PENDING_APPROVAL",
    });
    const activePolicies = await Policy.countDocuments({
      ...dateFilter,
      status: "ACTIVE",
    });
    const rejectedPolicies = await Policy.countDocuments({
      ...dateFilter,
      status: "REJECTED",
    });

    // Total coverage and exposure
    const policyMetrics = await Policy.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCoverage: { $sum: "$coverageAmount" },
          totalRetention: { $sum: "$retentionLimit" },
          avgCoverage: { $avg: "$coverageAmount" },
        },
      },
    ]);

    const metrics = policyMetrics[0] || {
      totalCoverage: 0,
      totalRetention: 0,
      avgCoverage: 0,
    };
    const totalExposure = metrics.totalCoverage - metrics.totalRetention;

    // Policy count by type
    const policyByType = await Policy.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total: totalPolicies,
      draft: draftPolicies,
      pending: pendingPolicies,
      active: activePolicies,
      rejected: rejectedPolicies,
      totalCoverage: metrics.totalCoverage,
      totalExposure: totalExposure,
      avgCoverage: metrics.avgCoverage,
      byType: policyByType || [],
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
    const { startDate, endDate } = req.query;
    const dateFilter = getDateFilter(startDate, endDate);

    // Claim counts by status
    const totalClaims = await Claim.countDocuments(dateFilter);
    const submittedClaims = await Claim.countDocuments({
      ...dateFilter,
      status: "SUBMITTED",
    });
    const underReviewClaims = await Claim.countDocuments({
      ...dateFilter,
      status: "UNDER_REVIEW",
    });
    const approvedClaims = await Claim.countDocuments({
      ...dateFilter,
      status: "APPROVED",
    });
    const rejectedClaims = await Claim.countDocuments({
      ...dateFilter,
      status: "REJECTED",
    });
    const settledClaims = await Claim.countDocuments({
      ...dateFilter,
      status: "SETTLED",
    });

    // Claim amounts and loss ratio
    const claimMetrics = await Claim.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalClaimAmount: { $sum: "$claimAmount" },
          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "APPROVED"] }, "$claimAmount", 0],
            },
          },
          settledAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "SETTLED"] }, "$claimAmount", 0],
            },
          },
          avgClaimAmount: { $avg: "$claimAmount" },
        },
      },
    ]);

    const claimMetricsData = claimMetrics[0] || {
      totalClaimAmount: 0,
      approvedAmount: 0,
      settledAmount: 0,
      avgClaimAmount: 0,
    };

    // Get total coverage to calculate loss ratio
    const totalCoverageData = await Policy.aggregate([
      { $match: { status: "ACTIVE" } },
      {
        $group: {
          _id: null,
          totalCoverage: { $sum: "$coverageAmount" },
        },
      },
    ]);

    const totalCoverage = totalCoverageData[0]?.totalCoverage || 1; // Avoid division by zero
    const lossRatio =
      totalCoverage > 0 ? (claimMetricsData.totalClaimAmount / totalCoverage) * 100 : 0;

    // Claims ratio
    const claimsRatio =
      totalClaims > 0
        ? ((approvedClaims + settledClaims) / totalClaims) * 100
        : 0;

    res.json({
      total: totalClaims,
      submitted: submittedClaims,
      underReview: underReviewClaims,
      approved: approvedClaims,
      rejected: rejectedClaims,
      settled: settledClaims,
      totalClaimAmount: claimMetricsData.totalClaimAmount,
      approvedAmount: claimMetricsData.approvedAmount,
      settledAmount: claimMetricsData.settledAmount,
      avgClaimAmount: claimMetricsData.avgClaimAmount,
      lossRatio: Math.round(lossRatio * 100) / 100,
      claimsRatio: Math.round(claimsRatio * 100) / 100,
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
    const { startDate, endDate } = req.query;
    const dateFilter = getDateFilter(startDate, endDate);

    // Allocation metrics
    const allocationMetrics = await Allocation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCeded: { $sum: "$cededAmount" },
          totalRetained: { $sum: "$retainedAmount" },
        },
      },
    ]);

    const allocMetrics = allocationMetrics[0] || {
      totalCeded: 0,
      totalRetained: 0,
    };

    // Treaty metrics
    const activeTreaties = await Treaty.countDocuments({ status: "ACTIVE" });
    const expiredTreaties = await Treaty.countDocuments({
      status: "EXPIRED",
    });

    // Unique reinsurance partners
    const partners = await Treaty.distinct("reinsurerName");

    const cededRetainedRatio =
      allocMetrics.totalCeded + allocMetrics.totalRetained > 0
        ? (allocMetrics.totalCeded /
            (allocMetrics.totalCeded + allocMetrics.totalRetained)) *
          100
        : 0;

    res.json({
      totalCeded: allocMetrics.totalCeded,
      totalRetained: allocMetrics.totalRetained,
      cededRetainedRatio: Math.round(cededRetainedRatio * 100) / 100,
      activeTreaties,
      expiredTreaties,
      totalTreaties: activeTreaties + expiredTreaties,
      partnersCount: partners.length,
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