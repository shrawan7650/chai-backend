import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookie?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log("token", token);f
    if (!token) {
      return res.status(401).send({ msg: "Access token is missing" });
    }

    const decodedToken = jwt.verify(token, process.env.Accesss_TOKEN_SECRET);
    console.log("decodedToken", decodedToken);

    req.userId = decodedToken._id;
    next();
  } catch (error) {
    res.status(401).send({ msg: error.message || "invalid access token" });
  }
});
