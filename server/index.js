const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const connectToDb = require('./database/database')
const userRoutes = require('./routes/route')

const app = express();
app.use(express.json());
app.use(cors());

const Port = process.env.PORT || 9000;
const Db_url = process.env.DB_URL;

app.get('/', (req, res) => {
    res.send(`FokuSpace server is running 🚀`)
})

app.use('/accounts', userRoutes)

app.listen(Port, async() => {
    try{
        await connectToDb(Db_url);
        console.log(`Connected To Database`);
        console.log(`Server is running on port http://localhost:${Port}`)
    }catch(err){
        console.log(err);
    }
})