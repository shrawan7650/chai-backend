import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewears/multer.middleware.js";


const router = Router();

router.post("/register", upload.fields([
  {
    name:"avatar",
    maxCount:1
  },{
    name:"coverimage",
    maxCount:1
  }
]), registerUser)

export default router;
