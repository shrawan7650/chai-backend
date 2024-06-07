import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary/cloudinary.js";

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
    res.send({status:400, msg:"Avatar file is required"})
}
  //upload them to cloudinary,avatar
  const avatar = await uploadFileOnCloudinary(avatarLocalPath)
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)
  // console.log("coverge image",coverImage)
  if (!avatar) {
    res.send({status:400, msg:"Avatar file is required"})
}
  
  //create user object - createentry in db

  const savedUSer = new User({
    fullname,
    avatar:avatar,
    email,
    coverImage:coverImage||"",
    password,
    username:username.toLowerCase()
  });
  await savedUSer.save();
  //remove password and refres token field from response
 const createdUser =  await User.findById(savedUSer._id).select("-password -refreshToken");
//  console.log("created userData",createdUser);``   
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