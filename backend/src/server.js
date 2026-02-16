// src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const policyRoutes = require("./routes/policyRoutes");
const claimRoutes = require("./routes/claimRoutes");
const treatyRoutes = require("./routes/treatyRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { protect, authorizeRoles } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/treaties", treatyRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Insurance API Running...");
});

app.get(
  "/api/admin-only",
  protect,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});