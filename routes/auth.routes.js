const { Router } = require("express");
const { signup, login, logout } = require("../controllers/auth.controllers");
const router = Router();

router.post("/signup", signup).post("/login", login).post("/logout", logout);

module.exports = router;
