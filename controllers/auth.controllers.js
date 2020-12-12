const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const { Error } = require("mongoose");

const hasCorrectPasswordFormat = (password) => {
  // min 6 char + one capital letter + one number + one lower case letter
  const passwordRegex = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/);
  return passwordRegex.test(password);
};

const isMongooseValidationError = (error) =>
  error instanceof Error.ValidationError;

// error = {code: 11000, message: "email is not unique"}
const isMongoError = ({ code: errorCode }) => errorCode === 11000;

const signup = async (req, res) => {
  try {
    const { password, email, username } = req.body;
    const isMissingCredentials = !password || !email || !username;
    if (isMissingCredentials) {
      return res.send("missing credentials");
    }
    if (!hasCorrectPasswordFormat(password)) {
      return res.send("incorrect password format");
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { passwordHash, ...user } = await User.create({
      email,
      passwordHash: hashedPassword,
      username,
    }).lean();
    console.log("user", user);

    req.session.currentUser = user;
    return res.send("signup successful");
  } catch (err) {
    if (isMongooseValidationError(err)) {
      return res.send("validation error: " + err.message);
    }
    if (isMongoError(err)) {
      return res.send("mongo error: " + err.message);
    }
    console.error(err);
  }
};

const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    const isMissingCredentials = !password || !email;
    if (isMissingCredentials) {
      return res.send("missing credentials");
    }

    const { passwordHash, ...user } = await User.findOne({ email }).lean();
    if (!user) {
      return res.send("user does not exist");
    }
    const verifiedPassword = await bcrypt.compare(password, passwordHash);
    if (!verifiedPassword) {
      return res.send("invalid credentials");
    }
    req.session.currentUser = user;
    return res.send("login successful");
  } catch (err) {
    console.error(err);
  }
};

const logout = (req, res) => {
  req.session.destroy();
  res.send("logout successful");
};

module.exports = { signup, login, logout };
