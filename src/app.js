import express, { json } from "express";
import cors from "cors";
import CookiesParser from "cookies-parser"
import userRouter from "./routes/user.routes.js";

const app = express();


app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}));
app.use(express.json());
app.use(express.urlencoded());//yah url ko encoded karta hai like space ka encode ka ka %20 kar dega
app.use(express.static("public"));
// app.use(CookiesParser()) 


//routes declaration

app.use("/api/v1/users",userRouter)





















export default app;