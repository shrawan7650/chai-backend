import mongoose, { Mongoose, Schema } from "mongoose";

const SubscriptionSchema = new Mongoose.Schema({
  subscriber:{
    type:Schema.Types.ObjectId, //one who is subscribing
   
  },
  channel:{
    type:Schema.Types.ObjectId, //one who is "subscriber" is subscribing
   
  },

 
},{timestamps:true});


export const  Subscription = Mongoose.model("Subscription",SubscriptionSchema);