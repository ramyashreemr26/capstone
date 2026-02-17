const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");

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
// Create User (Admin Only)
// ==============================
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      active: true,
    });

    // Audit Log
    await AuditLog.create({
      action: "USER_CREATED",
      description: `New user created: ${name} (${email}) with role ${role}`,
      performedBy: req.user._id,
      performedByEmail: req.user.email,
      details: {
        userId: newUser._id,
        userName: name,
        userEmail: email,
        role: role,
      },
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      },
    });
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
    const oldUser = await User.findById(req.params.id);

    if (!oldUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRole = oldUser.role;

    // Prevent admin from downgrading their own role
    if (oldUser._id.toString() === req.user._id.toString() && role !== "ADMIN") {
      return res
        .status(400)
        .json({ message: "You cannot downgrade your own admin role" });
    }

    oldUser.role = role;
    await oldUser.save();

    // Comprehensive Audit Log
    await AuditLog.create({
      action: "ROLE_UPDATED",
      description: `User role changed from ${oldRole} to ${role} for ${oldUser.name}`,
      performedBy: req.user._id,
      performedByEmail: req.user.email,
      details: {
        userId: oldUser._id,
        userName: oldUser.name,
        userEmail: oldUser.email,
        oldRole: oldRole,
        newRole: role,
      },
      createdAt: new Date(),
    });

    res.json({
      message: "User role updated successfully",
      user: oldUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Toggle User Active Status
// ==============================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldStatus = user.active;
    const newStatus = !user.active;
    user.active = newStatus;
    await user.save();

    // Comprehensive Audit Log
    const action = newStatus ? "USER_ACTIVATED" : "USER_DEACTIVATED";
    const statusText = newStatus ? "activated" : "deactivated";
    await AuditLog.create({
      action: action,
      description: `User ${statusText}: ${user.name} (${user.email})`,
      performedBy: req.user._id,
      performedByEmail: req.user.email,
      details: {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        oldStatus: oldStatus,
        newStatus: newStatus,
      },
      createdAt: new Date(),
    });

    res.json({
      message: `User ${statusText} successfully`,
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
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const deletedUser = user;
    await User.findByIdAndDelete(req.params.id);

    // Comprehensive Audit Log
    await AuditLog.create({
      action: "USER_DELETED",
      description: `User deleted: ${user.name} (${user.email}) with role ${user.role}`,
      performedBy: req.user._id,
      performedByEmail: req.user.email,
      details: {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        userStatus: user.active ? "Active" : "Inactive",
      },
      createdAt: new Date(),
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};