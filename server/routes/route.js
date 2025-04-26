const express = require('express');
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcryptjs');

router.use(express.json());


router.get('/users', async(req, res) => {
    try{
        res.send(`This is get endpoint!`)
    }catch(err){
        res.status(500).json({error: err.message})
    }
});

