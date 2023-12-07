const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../utils/verifyToken");

const {
  updateUser,
  deleteUser,
  getUser,
  getUsers,
} = require("../controllers/user");

//updateUser (edit User)
router.put("/:id", verifyAdmin, updateUser);

//deleteUser (edit User)
router.delete("/:id", verifyAdmin, deleteUser);

//getUser (show User edit)
router.get("/:id", verifyAdmin, getUser);

//getUser (show All User)
router.get("/", verifyAdmin, getUsers);

module.exports = router;
