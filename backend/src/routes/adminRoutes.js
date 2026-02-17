const express = require("express");
const router = express.Router();

const {
  getUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("ADMIN"), getUsers);

router.post("/", protect, authorizeRoles("ADMIN"), createUser);

router.put("/:id/role", protect, authorizeRoles("ADMIN"), updateUserRole);

router.put("/:id/status", protect, authorizeRoles("ADMIN"), toggleUserStatus);

router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteUser);

module.exports = router;