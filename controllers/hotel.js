const Hotel = require("../models/hotel");
const Room = require("../models/room");
const Transaction = require("../models/transaction");

//createHotel
exports.createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);

  try {
    const saveHotel = await newHotel.save();
    res.status(200).json(saveHotel);
  } catch (err) {
    next(err);
  }
};

//updateHotel
exports.updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};

//deleteHotel
exports.deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted!");
  } catch (err) {
    next(err);
  }
};

//getHotel
exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("rooms");
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};

//getHotels
exports.getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find().populate("rooms");
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};

//SearchHotels
exports.getSearchHotels = async (req, res, next) => {
  const { city, min, max, dateStart, dateEnd, people, room } = req.body;
  try {
    let list = await Hotel.find().populate("rooms");
    let transactions = await Transaction.find();
    if (city) {
      list = list.filter((hotel) => {
        return hotel.city.includes(city);
      });
    }
    list.map((hotels) => {
      const listRoom = hotels.rooms.map((room) => {
        return room;
      });
      const inBookingArr = transactions.filter((transaction) => {
        if (transaction.hotel.toString() === hotels._id.toString())
          return transaction;
      });
      const roomUnavailable = [];
      inBookingArr.forEach((item) => {
        item.room.forEach((roomNumber) => {
          roomUnavailable.push({
            room: roomNumber,
            dateStart: item.dateStart,
            dateEnd: item.dateEnd,
          });
        });
      });
      const roomNumberUnavailable = [];
      roomUnavailable.forEach((room) => {
        const start = new Date(room.dateStart);
        const end = new Date(room.dateEnd);
        const startDate = new Date(dateStart);
        const endDate = new Date(dateEnd);
        if (
          (start <= startDate && startDate <= end) ||
          (start <= endDate && endDate <= end)
        ) {
          roomNumberUnavailable.push(room.room[0]);
        }
      });
      const result = [];
      listRoom?.forEach((room) => {
        const roomArr = [];
        room.roomNumbers.map((roomNumber) => {
          if (!roomNumberUnavailable.includes(roomNumber[0])) {
            roomArr.push(roomNumber);
          }
        });
        room.roomNumbers = roomArr;
        if (room.roomNumbers.length > 0) {
          result.push(room);
        }
      });
      hotels.rooms = result;
    });
    const allRoomHotel = (hotel) => {
      let totalRoom = 0;
      hotel.rooms.map((room) => {
        totalRoom += room.roomNumbers.length;
      });
      return totalRoom;
    };
    const maxPeopleRoom = (hotel, room) => {
      let peopleRoom = 0;
      const listRoom = (hotel) => {
        return hotel.rooms.sort((a, b) => b.maxPeople - a.maxPeople);
      };
      const peopleRoomHotel = (room) => {
        let c = 0;
        for (let i = 0; i < listRoom(hotel).length; i++) {
          for (let j = 0; j < listRoom(hotel)[i].roomNumbers.length; j++) {
            if (c < room) {
              peopleRoom += listRoom(hotel)[i].maxPeople;
              c++;
            }
          }
        }
        return peopleRoom;
      };
      peopleRoomHotel(room);
      return peopleRoom;
    };
    if (room) {
      list = list.filter((hotel) => {
        if (allRoomHotel(hotel) >= room) return hotel;
      });
    }
    if (people) {
      list = list.filter((hotel) => {
        if (maxPeopleRoom(hotel, room) >= people) return hotel;
      });
    }
    if (min) {
      list = list.filter((hotel) =>
        hotel.rooms.some((room) => room.price >= min)
      );
    }
    if (max) {
      list = list.filter((hotel) =>
        hotel.rooms.some((room) => room.price <= max)
      );
    }
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

//countByCity
exports.countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => {
        return Hotel.countDocuments({ city: city });
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

//countByType
exports.countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });
    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resort", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

//topRateHotel
exports.topRateHotel = async (req, res, next) => {
  try {
    const hotels = await Hotel.find().populate("rooms");
    const topThreeRate = await hotels
      .sort((a, b) => b.rating - a.rating)
      .splice(0, 3);
    res.status(200).json(topThreeRate);
  } catch (err) {
    next(err);
  }
};

//getHotelRooms
// exports.getHotelRooms = async (req, res, next) => {
//   try {
//     const hotel = await Hotel.findById(req.params.id);
//     const list = await Promise.all(
//       hotel.rooms.map((room) => {
//         return Room.findById(room);
//       })
//     );
//     res.status(200).json(list);
//   } catch (err) {
//     next(err);
//   }
// };

//getHotelRoomTransaction
// exports.getHotelRoomTransaction = async (req, res, next) => {
//   try {
//     const inBookingArr = await Transaction.find({
//       hotel: req.params.id,
//     });
//     const roomUnavailable = [];
//     inBookingArr.forEach((item) => {
//       item.room.forEach((roomNumber) => {
//         roomUnavailable.push({
//           room: roomNumber,
//           dateStart: item.dateStart,
//           dateEnd: item.dateEnd,
//         });
//       });
//     });
//     res.status(200).json(roomUnavailable);
//   } catch (err) {
//     next(err);
//   }
// };

//postHotelRoomsAtTime
exports.postHotelRoomsAtTime = async (req, res, next) => {
  const { hotelId, dateStart, dateEnd } = req.body;
  try {
    const hotel = await Hotel.findById(hotelId);
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    const inBookingArr = await Transaction.find({
      hotel: hotelId,
    });
    const roomUnavailable = [];
    inBookingArr.forEach((item) => {
      item.room.forEach((roomNumber) => {
        roomUnavailable.push({
          room: roomNumber,
          dateStart: item.dateStart,
          dateEnd: item.dateEnd,
        });
      });
    });
    const roomNumberUnavailable = [];
    roomUnavailable.forEach((room) => {
      const start = new Date(room.dateStart);
      const end = new Date(room.dateEnd);
      const startDate = new Date(dateStart);
      const endDate = new Date(dateEnd);
      if (
        (startDate <= start && endDate >= start) ||
        (start <= startDate && startDate <= end)
      ) {
        roomNumberUnavailable.push(room.room[0]);
      }
    });
    const result = [];
    list.map((room) => {
      const roomArr = [];
      room.roomNumbers.map((roomNumber) => {
        if (!roomNumberUnavailable.includes(roomNumber[0])) {
          roomArr.push(roomNumber);
        }
      });
      room.roomNumbers = roomArr;
      if (room.roomNumbers.length > 0) {
        result.push(room);
      }
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
