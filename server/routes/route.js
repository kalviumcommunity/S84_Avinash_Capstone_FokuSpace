const express = require('express');
const mongoose = require('mongoose');


const router = express.Router();
router.use(express.json());


router.get('/get', async(req, res) => {
    try{
        res.send(`This is get endpoint !`);
    }catch(err){
        res.status(500).json({message: `Internal Server Error:`, error: err});
    }
})



module.exports = router;