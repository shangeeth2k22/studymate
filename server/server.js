require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectdB = require("./config/db");

const app = express();

app.use(cors({
    origin : process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/notes",require("./routes/noteRoutes"));

app.get("/",(req,res)=>{
    res.send("StudyMate API is running");
});

const PORT = process.env.PORT || 5000;

connectdB().then(()=>{
    app.listen(PORT , ()=>console.log(`Server running on port ${PORT}`));
});