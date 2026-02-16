const mongoose = require("mongoose");

const treatySchema = new mongoose.Schema(
  {
    treatyName: {
      type: String,
      required: true,
    },
    reinsurerName: {
      type: String,
      required: true,
    },
    sharePercentage: {
      type: Number, // e.g., 30 means 30%
      required: true,
    },
    retentionLimit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Treaty", treatySchema);