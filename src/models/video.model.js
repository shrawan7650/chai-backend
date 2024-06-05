import mongoose, { Mongoose, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Mongoose.Schema({
  videoFile:{
    type:String, //cloudinary url
    required:true
   
  },
  thumbnail:{
    type:String,
    required:true,
  },
  title:{
    type:String,
    required:true,
   
  },
  description:{
    type:String,  //cloudinary url
    required:true,
  },
  duration:{
    type:Number,   //cloudinary to send 
    required:true,
  },
  views:{
    type:Number,
default:0

  },
  isPublished:{
    type:Boolean,
    default:true
  },

  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);
export const  Video = Mongoose.model("Video",videoSchema);