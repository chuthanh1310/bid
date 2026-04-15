const express = require("express");
const router = express.Router();
const userController = require("./userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);
router.get("/verify", userController.verifyEmail);
module.exports = router;