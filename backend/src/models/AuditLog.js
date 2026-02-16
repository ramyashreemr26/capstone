const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        policyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Policy",
            required: false,
        },
        action: {
            type: String,
            enum: ["CREATED", "SUBMITTED", "APPROVED", "ROLE_UPDATED"],
            required: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);