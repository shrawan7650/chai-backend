import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
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

export default router;
