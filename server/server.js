const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const connectToDb = require('./database/database')
const route = require('./routes/route')

const app = express();
app.use(express.json());
app.use(cors());

const Port = process.env.PORT || 9000;
const DB_url = process.env.DB_URL;

app.get("/", (req, res) => {
    res.send(`Testing endpoint Of Avinash`);
})

app.use('/crud', route);

app.listen(Port, async(req, res) => {
    try{
        // connectToDb(DB_url);
        console.log(`Connected to port http://localhost:${Port}`);
    }catch(err){
        console.log(err);
    }
})

