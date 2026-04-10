const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);