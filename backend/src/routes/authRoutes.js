import express from "express";
import User  from "../models/User.js";
import jwt from "jsonwebtoken";
// import { use } from "react";


const router = express.Router();
const generateToken = (userId) => {
   return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"15d"})

}

router.post("/register", async (req, res) => {
  try{

    const {email,username,password} = req.body;
   if (!username || !email || !password) {
  return res.status(400).json({ message: "All fields are required" });
}
 if (username.length < 3) {
      return res.status(400).json({ message: "Username duhet të ketë të paktën 3 karaktere." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Fjalëkalimi duhet të ketë të paktën 6 karaktere." });
    }
const existingEmail = await User.findOne({email});
if(existingEmail){
    return res.status(400).json({message:"Email already exists"});
}
const existingUsername = await User.findOne({username});
if(existingUsername){
    return res.status(400).json({message:"Username already exists"});
}
const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
const user = new User({
    email,
    username,
    password,
    profileImage,
})
  await user.save();

  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user:{
        id:user._id,
        username:user.username,
        email:user.email,
        profileImage:user.profileImage
    },
  });
}catch(error){
    console.log("Error in register route", error);
    res.status(500).json({ message: "Something went wrong" });

  }
});

router.post("/login", async (req, res) => {
    // res.send("login");
    try{
      const {email, password} = req.body;
      if(!email || !password){
        return res.status(400).json({message:"All fields are required"});        
      }
      const user = await User.findOne({ email });
        if(!user) return res.status(400).json({message:"User does not exist"});

      const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials"});

      const token = generateToken(user._id);

      res.status(200).json({
        token, user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        }
      })
    } catch (error){
      console.log("Error in login route", error);
      res.status(500).json({message:"Internal server error"})

    }
});

export default router;
