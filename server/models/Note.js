const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User" ,
        required : true
    },
    title : {
        type : String,
        required :true,
        trim : true
    },
    text : {
        type : String,
        required : true
    },
    summary : {
        type : String,
        default: ""
    },
    quiz : [
        {
            question : String,
            options : [String],
            answer : String
        },
    ],
    flashcards : [
        {
            front : String,
            back : String
        },
    ],
    },
    {
        timestamps : true,
    }
);

module.exports = mongoose.model("Note", noteSchema);