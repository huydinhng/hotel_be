const Transaction = require("../models/transaction");
const { createError } = require("../utils/error");

//createTransaction (check room available at Time booking?createTransaction:createError)
exports.createTransaction = async (req, res, next) => {
  const { hotel, room, dateStart, dateEnd, price, payment, status } = req.body;
  const user = req.params.userId;
  const inBookingArr = await Transaction.find({ hotel: hotel });
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

  try {
    const transaction = new Transaction({
      user,
      hotel,
      room,
      dateStart,
      dateEnd,
      price,
      payment,
      status,
    });
    //check room available at Time booking
    room.forEach((room) => {
      if (roomNumberUnavailable.includes(room[0]))
        return next(createError(404));
    });
    const saveTransaction = await transaction.save();
    res.status(200).json(saveTransaction);
  } catch (err) {
    next(err);
  }
};

//getTransactions (show transactions and set status:booker=>Checkin||Checkout )
exports.getTransactions = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const transactions = await Transaction.find({ user: userId })
      .populate("user")
      .populate("hotel");
    transactions.forEach((transaction) => {
      if (
        transaction.dateStart <= new Date() &&
        transaction.dateEnd >= new Date()
      ) {
        transaction.status = "Checkin";
      } else if (transaction.dateEnd < new Date()) {
        transaction.status = "Checkout";
      }
    });
    res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
};

//getLastestTransactions(show 8 Latest Transactions)
exports.getLastestTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("user")
      .populate("hotel")
      .sort({ createdAt: -1 })
      .limit(8);
    transactions.forEach((transaction) => {
      if (
        transaction.dateStart <= new Date() &&
        transaction.dateEnd >= new Date()
      ) {
        transaction.status = "Checkin";
      } else if (transaction.dateEnd < new Date()) {
        transaction.status = "Checkout";
      }
    });
    res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
};

//getAllTransactions(show All Transactions, set and save status:booker=>Checkin||Checkout)
exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("user")
      .populate("hotel")
      .sort({ createdAt: -1 });
    transactions.forEach((transaction) => {
      if (
        transaction.dateStart <= new Date() &&
        transaction.dateEnd >= new Date()
      ) {
        transaction.status = "Checkin";
      } else if (transaction.dateEnd < new Date()) {
        transaction.status = "Checkout";
      }
      transaction.save();
    });

    res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
};
