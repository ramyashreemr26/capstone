const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        policyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Policy",
            required: false,
        },
        claimId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Claim",
            required: false,
        },
        treatyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Treaty",
            required: false,
        },
        action: {
            type: String,
            enum: [
                "POLICY_CREATED",
                "POLICY_SUBMITTED",
                "POLICY_APPROVED",
                "ALLOCATION_CREATED",
                "CLAIM_CREATED",
                "CLAIM_REVIEWED",
                "CLAIM_APPROVED",
                "CLAIM_REJECTED",
                "CLAIM_SETTLED",
                "TREATY_CREATED",
                "TREATY_DELETED",
                "ROLE_UPDATED",
                "USER_ACTIVATED",
                "USER_DEACTIVATED",
                "USER_CREATED",
                "USER_DELETED",
            ],
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        performedByEmail: {
            type: String,
            required: false,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
    },
    { timestamps: true }
);

// Indexes to speed common queries
auditLogSchema.index({ policyId: 1 });
auditLogSchema.index({ claimId: 1 });
auditLogSchema.index({ treatyId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ createdAt: -1 });

// Prevent updates/deletes to audit logs (append-only)
auditLogSchema.pre(["updateOne", "findOneAndUpdate", "deleteOne"], function (next) {
    const err = new Error("Audit logs are immutable and cannot be modified");
    next(err);
});

module.exports = mongoose.model("AuditLog", auditLogSchema);