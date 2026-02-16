const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      required: true,
      unique: true,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    claimAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "SETTLED",
      ],
      default: "SUBMITTED",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);