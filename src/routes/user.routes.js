import { Router } from "express";
import {
  changeCurrentPassword,
  getProfilePage,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetials,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChanelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewears/multer.middleware.js";
import { verifyToken } from "../middlewears/auth.middlewear.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.post("/login", loginUser);

//secured routes
router.post("/logout", verifyToken, logoutUser);
router.post("/refreshToken", refreshAccessToken);
router.post("/changePassword", verifyToken, changeCurrentPassword);
router.get("/getProfile", verifyToken, getProfilePage);
router.patch("/updateProfile", verifyToken, updateAccountDetials);
router.patch(
  "/updateAvatar",
  verifyToken,
  upload.single("avatar"),
  updateUserAvatar,
);
router.patch(
  "/updateCoverImage",
  verifyToken,
  upload.single("coverImage"),
  updateUserCoverImage,
);
router.post("/channelprofile/:username", getUserChanelProfile);
router.get("/watchHistory", verifyToken, getWatchHistory);

export default router;
