const express = require("express");
const UserController = require("../controllers/userController");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/register", UserController.userRegister);
router.post("/login", UserController.useLogin);
router.post(
  "/send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// router.use("/changepassword", auth);
router.post("/changepassword", auth, UserController.changeUserPassword);
router.get("/loggeduser", auth, UserController.loggedUser);

module.exports = router;
