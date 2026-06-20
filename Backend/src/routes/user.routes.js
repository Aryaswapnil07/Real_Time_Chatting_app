import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  searchUsers,
  getUserProfile,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// Public Routes

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);


// Protected Routes

router.route("/logout").post(
  verifyJWT,
  logoutUser
);

router.route("/change-password").post(
  verifyJWT,
  changeCurrentPassword
);

router.route("/current-user").get(
  verifyJWT,
  getCurrentUser
);

router.route("/update-account").patch(
  verifyJWT,
  updateAccountDetails
);

router.route("/update-avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);


// Search Users

router.route("/search").get(
  verifyJWT,
  searchUsers
);


// User Profile

router.route("/profile/:userId").get(
  verifyJWT,
  getUserProfile
);


export default router;