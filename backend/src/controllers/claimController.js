const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const AuditLog = require("../models/AuditLog");

// Get All Claims
const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("policyId", "policyNumber insuredName coverageAmount status")
      .populate("createdBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });
    
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Claim
const createClaim = async (req, res) => {
  try {
    const { claimNumber, policyId, claimAmount } = req.body;

    const policy = await Policy.findById(policyId);

    if (!policy || policy.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Claims can only be created for ACTIVE policies",
      });
    }

    if (claimAmount > policy.coverageAmount) {
      return res.status(400).json({
        message: "Claim amount exceeds policy coverage",
      });
    }

    const claim = await Claim.create({
      claimNumber,
      policyId,
      claimAmount,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      policyId: policy._id,
      claimId: claim._id,
      action: "CLAIM_CREATED",
      performedBy: req.user._id,
    });

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim || claim.status !== "SUBMITTED") {
      return res.status(400).json({
        message: "Only SUBMITTED claims can move to review",
      });
    }

    claim.status = "UNDER_REVIEW";
    claim.reviewedBy = req.user._id;
    await claim.save();

    await AuditLog.create({
      policyId: claim.policyId,
      claimId: claim._id,
      action: "CLAIM_REVIEWED",
      performedBy: req.user._id,
    });

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim || claim.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        message: "Only UNDER_REVIEW claims can be approved",
      });
    }

    claim.status = "APPROVED";
    await claim.save();

    await AuditLog.create({
      policyId: claim.policyId,
      claimId: claim._id,
      action: "CLAIM_APPROVED",
      performedBy: req.user._id,
    });

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim || claim.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        message: "Only UNDER_REVIEW claims can be rejected",
      });
    }

    claim.status = "REJECTED";
    await claim.save();

    await AuditLog.create({
      policyId: claim.policyId,
      claimId: claim._id,
      action: "CLAIM_REJECTED",
      performedBy: req.user._id,
    });

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const settleClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim || claim.status !== "APPROVED") {
      return res.status(400).json({
        message: "Only APPROVED claims can be settled",
      });
    }

    claim.status = "SETTLED";
    await claim.save();

    await AuditLog.create({
      policyId: claim.policyId,
      claimId: claim._id,
      action: "CLAIM_SETTLED",
      performedBy: req.user._id,
    });

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllClaims,
  createClaim,
  reviewClaim,
  approveClaim,
  rejectClaim,
  settleClaim,
};