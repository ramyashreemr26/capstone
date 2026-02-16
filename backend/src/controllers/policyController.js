const Policy = require("../models/Policy");
const AuditLog = require("../models/AuditLog");
const Treaty = require("../models/Treaty");
const Allocation = require("../models/Allocation");

// @desc Create Policy (DRAFT)
// @route POST /api/policies
// @access UNDERWRITER
const createPolicy = async (req, res) => {
    try {
        const {
            policyNumber,
            insuredName,
            coverageAmount,
            premium,
            retentionLimit,
        } = req.body;

        const policy = await Policy.create({
            policyNumber,
            insuredName,
            coverageAmount,
            premium,
            retentionLimit,
            createdBy: req.user._id,
        });

        await AuditLog.create({
            policyId: policy._id,
            action: "CREATED",
            performedBy: req.user._id,
        });

        res.status(201).json({
            message: "Policy created successfully",
            policy,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Submit Policy for Approval
// @route PUT /api/policies/:id/submit
// @access UNDERWRITER
const submitForApproval = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        if (policy.status !== "DRAFT") {
            return res.status(400).json({
                message: "Only DRAFT policies can be submitted",
            });
        }

        policy.status = "PENDING_APPROVAL";
        await policy.save();

        await AuditLog.create({
            policyId: policy._id,
            action: "SUBMITTED",
            performedBy: req.user._id,
        });

        res.json({
            message: "Policy submitted for approval",
            policy,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Approve Policy
// @route PUT /api/policies/:id/approve
// @access ADMIN
const approvePolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        if (policy.status !== "PENDING_APPROVAL") {
            return res.status(400).json({
                message: "Only PENDING_APPROVAL policies can be approved",
            });
        }

        policy.status = "ACTIVE";
        await policy.save();

        // Reinsurance Allocation Logic
if (policy.coverageAmount > policy.retentionLimit) {
  const treaties = await Treaty.find({ status: "ACTIVE" });

  const cededBase = policy.coverageAmount - policy.retentionLimit;

  for (let treaty of treaties) {
    const cededAmount = (cededBase * treaty.sharePercentage) / 100;

    await Allocation.create({
      policyId: policy._id,
      treatyId: treaty._id,
      cededAmount,
      retainedAmount: policy.retentionLimit,
      percentage: treaty.sharePercentage,
    });
  }
}

        await AuditLog.create({
            policyId: policy._id,
            action: "APPROVED",
            performedBy: req.user._id,
        });

        res.json({
            message: "Policy approved successfully",
            policy,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Policy by ID
// @route GET /api/policies/:id
// @access AUTHENTICATED USERS
const getPolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        res.json(policy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get All Policies
// @route GET /api/policies
// @access AUTHENTICATED USERS
const getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find()
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        res.json(policies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Policy Audit Logs
// @route GET /api/policies/:id/audit
// @access ADMIN
const getPolicyAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({
            policyId: req.params.id,
        })
            .populate("performedBy", "name email role")
            .sort({ createdAt: 1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { createPolicy, submitForApproval, approvePolicy, getPolicy, getAllPolicies, getPolicyAuditLogs };