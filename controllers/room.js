const Room = require("../models/room");
const Hotel = require("../models/hotel");

//createNewRoom
exports.createNewRoom = async (req, res, next) => {
  const newRoom = new Room(req.body);
  try {
    const savedRoom = await newRoom.save();
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

//updateRoom (editRoom)
exports.updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

//deleteRoom
exports.deleteRoom = async (req, res, next) => {
  const hotels = await Hotel.find();
  const hotelIndex = hotels.findIndex((h) =>
    h.rooms.some((r) => r === req.params.id)
  );
  const hotelId = hotels[hotelIndex]?._id;
  try {
    await Room.findByIdAndDelete(req.params.id);
    if (hotelId) {
      try {
        await Hotel.findByIdAndUpdate(hotelId, {
          $pull: { rooms: req.params.id },
        });
      } catch (err) {
        next(err);
      }
    }

    res.status(200).json("Room has been deleted!");
  } catch (err) {
    next(err);
  }
};

//getRoom (show Room edit)
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};

//getRooms(show All Room)
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
