require("dotenv").config();

const  { askGemini } = require("./utils/gemini");

askGemini("Explain what MongoDB is in 2 short sentences")
    .then((reply)=> console.log("Gemini says:\n",reply))
    .catch((err)=> console.error("Gemini error:",err.message));