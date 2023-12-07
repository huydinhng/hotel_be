const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../utils/verifyToken");

const {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getHotels,
  countByCity,
  countByType,
  topRateHotel,
  getSearchHotels,
  postHotelRoomsAtTime,
} = require("../controllers/hotel");

//createHotel
router.post("/", verifyAdmin, createHotel);

//updateHotel
router.put("/:id", verifyAdmin, updateHotel);

//deleteHotel
router.delete("/:id", verifyAdmin, deleteHotel);

//getHotel
router.get("/find/:id", getHotel);

//getHotels
router.get("/", getHotels);

//SearchHotels
router.post("/search", getSearchHotels);

//countByCity
router.get("/countByCity", countByCity);

//countByType
router.get("/countByType", countByType);

//topRateHotel
router.get("/topRateHotel", topRateHotel);

//postHotelRoomsAtTime
router.post("/time", postHotelRoomsAtTime);

module.exports = router;
