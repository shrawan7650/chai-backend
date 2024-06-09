import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary/cloudinary.js";
import cookie from "cookies-parser";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (id) => {
  try {
    const user = await User.findById(id);
    console.log("generataeUSer", user);
    const accessToken = await user.generatAccessToken();
    console.log("accessToken", accessToken);
    const refreshToken = await user.generatRefreshToken();
    console.log("refreshToken", refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // console.log("req fie",req.files)
  //get user detials from frontend
  const { username, password, email, fullname } = req.body;

  //validationn-no empty
  if (!fullname || !username || !password || !email) {
    res.send({ msg: "all fielsd are required", status: 408 });
  }
  //check if user already exist:email
  const existeduser = await User.findOne({ $or: [{ username }, { email }] });
  if (existeduser) {
    res.send({ msg: "email already exist", status: 409 });
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("coverge imageLocalPath",coverImageLocalPath)
  // let coverImageLocalPath;
  // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
  //     coverImageLocalPath = req.files.coverImage[0].path
  // }

  if (!avatarLocalPath) {
    res.send({ status: 400, msg: "Avatar file is required" });
  }
  //upload them to cloudinary,avatar
  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
  // console.log("coverge image",coverImage)
  if (!avatar) {
    res.send({ status: 400, msg: "Avatar file is required" });
  }

  //create user object - createentry in db

  const savedUSer = new User({
    fullname,
    avatar: avatar,
    email,
    coverImage: coverImage || "",
    password,
    username: username.toLowerCase(),
  });
  await savedUSer.save();
  //remove password and refres token field from response
  const createdUser = await User.findById(savedUSer._id).select(
    "-password -refreshToken",
  );
  //  console.log("created userData",createdUser);``
  //check for user creation
  if (!createdUser) {
    res.send({ msg: "something went wrong while registring the user " });
  }
  //send response to frontend
  res.status(201).json({
    success: true,
    user: createdUser,
    msg: "Account created Sucessfully",
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  // email and password from clients
  const { username, email, password } = req.body;
  console.log(email);
  //check validation
  if (!(username || email) || !password) {
    return res.send({ msg: "username and password Inavlid" });
  }
  if (!(username || email)) {
    res.send({ msg: "username and email is required" });
  }
  //check user exist or note
  const user = await User.findOne({ $or: [{ username }, { email }] });
  console.log("userCheck", user);
  //check user validation
  if (!user) {
    res.send({ msg: "user doesnot exist", status: 404 });
  }
  //check password are coorect or not in database
  const isPasswordValid = await user.ischeckPassword(password);
  if (!isPasswordValid) {
    res.send({ sg: "Invalid user credentials", status: 401 });
  }
  // Generate access and refresh tokens
  const accessToken = await generateAccessAndRefreshTokens(user._id);
  // console.log("access token",accessToken)
  const refreshToken = await generateAccessAndRefreshTokens(user._id);
  // console.log("refresh Token",refreshToken);
  //send refresh token from server to clients by using cookies and store refresh token in database
  const logeedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json({
      status: 200,
      user: logeedInUser,
      accessToken,
      refreshToken,
      msg: "user logged in Successfully",
    });
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Update user to remove refresh token
    await User.findByIdAndUpdate(
      req.userId,
      { $unset: { refreshToken: "" } },
      { new: true },
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict", // Ensures cookies are sent only to your server
    };

    // Clear cookies and respond
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ status: 200, msg: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, msg: "Logout failed", error: error.message });
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      res.send({ msg: "unothorised request", status: 401 });
    }

    const decode = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    console.log("decode", decode);
    const user = await User.findById(decode?._id);
    if (!user) {
      res.send({ msg: "user not found", status: 401 });
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      return res.send({
        status: 401,
        msg: "Refresh token is expaired or used",
      });
    }
    const option = {
      httpOnly: true,
      secure: true,
    };
    const newAcccessToken = await generateAccessAndRefreshTokens(user._id);
    const newRefreshToken = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", newAcccessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json({
        status: 200,
        accessToken: newAcccessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    res.send({ msg: error.message });
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req?.userId;
  const user = await User.findById(id);
  const ischeckPassword = await user.ischeckPassword(oldPassword);
  if (!ischeckPassword) {
    return res.send({ msg: "Invalid old Password" });
  }
  user.password = newPassword;
  await user.save({ validateBeforSave: false });

  res.status(200).send({ msg: "password change Successfully" });
});

const getProfilePage = asyncHandler(async (req, res) => {
  const id = req?.userId;
  const user = await User.findById(id).select("-password -refreshToken");

  res.status(200).send({ msg: "password change Successfully", user: user });
});

const updateAccountDetials = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    return res.send({ msg: "All Fields are Required" });
  }
  const user = await User.findByIdAndUpdate(
    req?.userId,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true },
  ).select("-password");

  res.send({ msg: "update Successfully", user: user });
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    res.send({ msg: "Avatar file is missing" });
    const avatar = await uploadFileOnCloudinary(avatarLocalPath);

    if (!avatar) {
      res.send({ msg: "Avatar is Required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { avatar } },
      { new: true },
    ).select("-password");

    res.send({ msg: "Avatar Update is Successfully", user: user });
  }
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    res.send({ msg: "coverImage file is missing" });
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
      res.send({ msg: "Avatar is Required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { coverImage } },
      { new: true },
    ).select("-password");

    res.send({ msg: "Avatar Update is Successfully", user: user });
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getProfilePage,
  updateAccountDetials,
  updateUserAvatar,
  updateUserCoverImage
};
