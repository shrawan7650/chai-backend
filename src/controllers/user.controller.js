import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
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

  //check fro images,check for avatar
  const avaterrequestImage = req.file?.avatar[0]?.path;
  console.log("requestImageLocalPath", avaterrequestImage);

  const coverImagePath = req.file?.coverImage[0]?.path;
  console.log("coverImage", coverImagePath);
  
  if (!avaterrequestImage) {
    res.send({ msg: "Avatar file is required" });
  }
  //upload them to cloudinary,avatar
  const avatar = await uploadFileOnCloudinary(avaterrequestImage);
  const coverImageUpload = await uploadFileOnCloudinary(coverImagePath);
  if (!avatar) {
    res.send({ msg: " avatar is not define " });
  }
  //create user object - createentry in db

  const savedUSer = await User.Create({
    fullname,
    avatar:avatar.url,
    email,
    coverImage:coverImage?.url||"",
    password,
    username:username.toLowerCase()
  });
  //remove password and refres token field from response
 const createdUser =  await User.findById(savedUSer._id).select("-password -refreshToken");
 console.log("created userData",createdUser);
 //check for user creation
 if(!createdUser){
  res.send({msg:"something went wrong while registring the user "})
 }
  //send response to frontend
  res.status(201).json({
    success:true,
    user:createdUser,
    msg:"Account created Sucessfully"
  })
});
export { registerUser };
