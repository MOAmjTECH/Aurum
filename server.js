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

app.post("/login",(req,res)=>{

    const {email,password} = req.body;

    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err,result)=>{

        if(result.length === 0){
            return res.status(401).json({
                message:"User not found"
            });
        }

        const user = result[0];

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if(!match){
            return res.status(401).json({
                message:"Wrong password"
            });
        }

        res.json({
            message:"Success",
            user
        });

    });

});


app.post("/transactions",(req,res)=>{

    const {
      user_email,
      description,
      amount,
      date,
      type,
      category
    } = req.body;

    db.query(
      `INSERT INTO transactions
      (user_email,description,amount,date,type,category)
      VALUES (?,?,?,?,?,?)`,
      [
        user_email,
        description,
        amount,
        date,
        type,
        category
      ],
      (err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json({ message:"Saved" });

    });

});


app.get("/transactions/:email",(req,res)=>{

    db.query(
      "SELECT * FROM transactions WHERE user_email=?",
      [req.params.email],
      (err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

app.delete("/transactions/:id",(req,res)=>{

    db.query(
      "DELETE FROM transactions WHERE id=?",
      [req.params.id],
      (err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json({ message:"Deleted" });

      }
    );

});


app.listen(3000,()=>{
    console.log("Running on port 3000");
});