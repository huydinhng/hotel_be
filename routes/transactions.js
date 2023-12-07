const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../utils/verifyToken");

const {
  getTransactions,
  createTransaction,
  getLastestTransactions,
  getAllTransactions,
} = require("../controllers/transaction");

//createTransaction
router.post("/:userId", createTransaction);

//getLastestTransactions
router.get("/lastest", getLastestTransactions);

//getTransactions
router.get("/:userId", getTransactions);

//getAllTransactions
router.get("/", verifyAdmin, getAllTransactions);

module.exports = router;
