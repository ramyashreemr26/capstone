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

module.exports = mongoose.model("Allocation", allocationSchema);