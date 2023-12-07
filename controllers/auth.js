const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createError } = require("../utils/error");

//register
exports.register = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) return next(createError(404, "This user has already existed!"));
    if (!user) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const newUser = new User({
        username: req.body.username,
        password: hash,
        fullName: req.body.fullName || null,
        phoneNumber: req.body.phoneNumber || null,
        email: req.body.email || null,
        isAdmin: req.body.isAdmin || false,
      });
      await newUser.save();
      res.status(200).send("User has been created!");
    }
  } catch (err) {
    next(err);
  }
};

//login
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );
    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ isAdmin: isAdmin, details: { ...otherDetails }, token: token });
  } catch (err) {
    next(err);
  }
};
