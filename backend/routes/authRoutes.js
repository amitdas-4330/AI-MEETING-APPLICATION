const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// REGISTER

router.post("/register", async(req,res)=>{

  try {

    const { name, email, password } = req.body;

    const exists =
      await User.findOne({ email });

    if(exists)
      return res
        .status(400)
        .json({message:"User exists"});

    const hash =
      await bcrypt.hash(password,10);

    const user = new User({
      name,
      email,
      password: hash
    });

    await user.save();

    res.json({
      message:"Registered"
    });

  } catch(err){

    res.status(500).json({
      message: err.message
    });

  }

});

// LOGIN

router.post("/login", async(req,res)=>{

  try {

    const {email,password} = req.body;

    const user =
      await User.findOne({email});

    if(!user)
      return res.status(404).json({
        message:"User not found"
      });

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if(!valid)
      return res.status(401).json({
        message:"Wrong password"
      });

    const token =
      jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
      );

    res.json({
      message:"Login success",
      token
    });

  } catch(err){

    res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;