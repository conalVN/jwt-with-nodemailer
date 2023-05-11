const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailConfig");

class UserController {
  static userRegister = async (req, res) => {
    const { name, email, password, password_confirm, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      if (name && email && password && password_confirm && tc) {
        if (password === password_confirm) {
          try {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(password, salt);
            const doc = new UserModel({
              name,
              email,
              password: hashPass,
              tc,
            });
            await doc.save();
            const userDoc = await UserModel.findOne({ email: email });
            // generate token
            const token = jwt.sign(
              { userId: userDoc._id },
              process.env.SECRET_KEY,
              { expiresIn: "7d" }
            );
            res.status(201).send({
              status: "successfully",
              message: "Register success!",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.send({ status: "failed", message: "Unable to register" });
          }
        } else {
          res.send({ status: "failed", message: "Password doesn't match" });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  static useLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (email === user.email && isMatch) {
            // generate token
            const token = jwt.sign(
              { userId: user._id },
              process.env.SECRET_KEY,
              { expiresIn: "7d" }
            );
            res.send({
              status: "success",
              message: "Login successfully!",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Password is not valid",
            });
          }
        } else {
          res.send({ status: "failed", message: "User not found" });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    try {
      const { password, password_confirm } = req.body;
      if (password && password_confirm) {
        if (password !== password_confirm) {
          res.send({
            status: "failed",
            message: "New password and Confirm password doesn't match",
          });
        } else {
          const salt = bcrypt.genSaltSync(10);
          const hashNewPass = bcrypt.hashSync(password, salt);
          await UserModel.findByIdAndUpdate(req.user._id, {
            $set: { password: hashNewPass },
          });
          res.send({
            status: "success",
            message: "Password change successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All feilds are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({});
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.SECRET_KEY;
        const token = jwt.sign({ userId: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        // console.log(link);
        //send email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Shopconal - password reset link",
          html: `<a href=${link}>Click here</a> to reset your password`,
        });
        res.send({
          status: "success",
          message: "Password reset email sent...Please check your email",
          info: info,
        });
      } else {
        res.send({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res.send({ status: "failed", message: "Email doesn't exists" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirm } = req.body;
    const { id, token } = req.params;
    const user = UserModel.findById(id);
    const new_secret = user._id + process.env.SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirm) {
        if (password !== password_confirm) {
          res.send({ status: "failed", message: "New password doesn't match" });
        } else {
          const salt = bcrypt.genSaltSync(10);
          const hashNewPass = bcrypt.hashSync(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: hashNewPass },
          });
          res.send({
            status: "success",
            message: "Password reset successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All feild are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid token" });
    }
  };
}

module.exports = UserController;
