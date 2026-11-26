require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectdB = require("./config/db");

const app = express();

app.use(cors({
    origin : process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express.json());


app.get("/",(req,res)=>{
    res.send("StudyMate API is running");
});

app.use("/api", async ( req, res, next)=>{
    try{
        await connectdB();
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : "Database connection failed"});
    }
})

app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/notes",require("./routes/noteRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));