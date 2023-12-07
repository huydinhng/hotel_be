const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../utils/verifyToken");

const {
  createNewRoom,
  updateRoom,
  deleteRoom,
  getRoom,
  getRooms,
} = require("../controllers/room");

//CREATE
router.post("/new", verifyAdmin, createNewRoom);

//UPDATE
router.put("/:id", verifyAdmin, updateRoom);
//DELETE
router.delete("/:id", verifyAdmin, deleteRoom);

//GET
router.get("/:id", getRoom);

//GET ALL
router.get("/", getRooms);

module.exports = router;
