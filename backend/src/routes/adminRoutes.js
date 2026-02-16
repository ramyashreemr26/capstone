const express = require("express");
const router = express.Router();

const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("ADMIN"), getUsers);

router.put("/:id/role", protect, authorizeRoles("ADMIN"), updateUserRole);

router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteUser);

module.exports = router;