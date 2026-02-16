const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
    {
        policyNumber: {
            type: String,
            required: true,
            unique: true,
        },
        insuredName: {
            type: String,
            required: true,
        },
        coverageAmount: {
            type: Number,
            required: true,
        },
        premium: {
            type: Number,
            required: true,
        },
        retentionLimit: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["DRAFT", "PENDING_APPROVAL", "ACTIVE"],
            default: "DRAFT",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

policySchema.virtual("exposure").get(function () {
    return this.coverageAmount - this.retentionLimit;
});

module.exports = mongoose.model("Policy", policySchema);