const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// ==============================
// Get All Users
// ==============================
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Update User Role
// ==============================
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    // Audit Log
    await AuditLog.create({
      policyId: null, // system level change
      action: "ROLE_UPDATED",
      performedBy: req.user._id,
    });

    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Delete User
// ==============================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
};