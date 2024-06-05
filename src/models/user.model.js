import mongoose, { Mongoose, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Mongoose.Schema({
  username:{
    type:String,
    required:true,
    trim:true,
    lowecase:true,
    index:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    trim:true,
    lowecase:true,
    unique:true
  },
  fullname:{
    type:String,
    required:true,
    trim:true,
    lowecase:true,
    index:true,
  },
  avatar:{
    type:String,  //cloudinary url
    // required:true,
  },
  watchHistory:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Video"
    }
  ],
  password:{
    type:String,
    required:[true,'password is required'],

  },
  refreshToken:{
    type:String
  }
},{timestamps:true});
userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
this.password = bcrypt.hash(this.password,10);
next();
});
userSchema.methods.ischeckPassword = async function (password) {
 return await bcrypt.compare(password,this.password)
};

userSchema.methods.generatAccessToken = (async function (){
  const payload = {
   _id:this._id,
   email:this.email
  }
return jwt.sign(payload,process.env.Accesss_TOKEN_SECRET,{expireIn:process.env.Accesss_TOKEN_EXPIRY});
  
 });
userSchema.methods.generatRefreshToken = (async function (){
  const payload = {
   _id:this._id,
   email:this.email
  }
return jwt.sign(payload,process.env.EFRESH_TOKEN_SECRET,{expireIn:process.env.REFRESH_TOKEN_EXPIRY});
  
 });
export const  User = Mongoose.model("User",userSchema);