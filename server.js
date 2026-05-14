const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "amiji123",
    database: "aurum_finance"
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected");
    }
});

app.post("/register", async (req,res)=>{

    const {name,email,password} = req.body;

    const hashed = await bcrypt.hash(password,10);

    const sql =
      "INSERT INTO users(name,email,password) VALUES(?,?,?)";

    db.query(sql,[name,email,hashed],(err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json({ message:"Registered" });

    });

});