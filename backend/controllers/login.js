const Admin = require('../models/admin')
const jwt = require('jsonwebtoken')
const express = require('express')

const payload = { userId: 123 };
const secretkey = 'This is my secxrettt keyy'


const login =  async (req, res) => {
  try {
    
    console.log("Visited-------LOGIN ROUTE--------------------+++++++++++++++++++++++++++++++++");
    console.log(req.body);
    
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if (admin) {
      const token = await jwt.sign(payload,secretkey,{expiresIn:"1h"})
      return res.json({token : token, success:true, message:'Admin Logged in successfully'})
    } else {
      return res.status(401).json({ success: false, message: 'Invalid username or password ' });
    }
  } catch (error) {
    console.log("LOGIN ERROR",error);
  }
  }


module.exports = login;