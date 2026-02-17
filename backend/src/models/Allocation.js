const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
    },
    treatyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treaty",
    },
    cededAmount: Number,
    retainedAmount: Number,
    percentage: Number,
  },
  { timestamps: true }
);

// Indexes for faster lookups
allocationSchema.index({ policyId: 1 });
allocationSchema.index({ treatyId: 1 });
allocationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Allocation", allocationSchema);