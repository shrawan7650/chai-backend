import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowecase: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowecase: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      lowecase: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      // required:true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.ischeckPassword = async function (password) { 
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generatAccessToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
  };
  return jwt.sign(payload, process.env.Accesss_TOKEN_SECRET, {
    expiresIn: "15m", // Example expiration time for access token
  });
};
userSchema.methods.generatRefreshToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // Example expiration time for refresh token
  });
};
export const User = mongoose.model("User", userSchema);
