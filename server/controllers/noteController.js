const { PDFParse } = require("pdf-parse");
const Note = require("../models/Note");
const { makeSummary, makeQuiz, makeFlashcards } = require("../utils/gemini");

const createNote = async (req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({message : "please upload a file"});
        }

        const parser = new PDFParse({data : req.file.buffer});
        const result = await parser.getText({pageJoiner : ""});
        await parser.destroy();
        const text = result.text.trim();

        if(!text){
            return res.status(400).json({message : "No text found in this PDF"});
        }

        const title = req.file.originalname.replace(/\.pdf$/i,"");

        const note = await Note.create({user:req.user._id , title ,text});

        try{
            note.summary = await makeSummary(text);
            await note.save();
        }
        catch(err){
            console.log("Summary failed: ",err.message);
        }

        res.status(201).json({
            id : note._id,
            title : note.title,
            createdAt : note.createdAt,
            summary : note.summary
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : "Server error"});
    }
};

//GET /api/notes -> my notes list (for Home)
const getNotes = async (req,res)=>{
    try{
        const notes = await Note.find({user:req.user._id})
         .select("title createdAt")
         .sort({createdAt:-1});
        res.status(200).json(notes);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : "Server error"});
    }
};

//GET /api/notes/:id -> one note
const getNote = async (req,res)=>{
    try{
        const note = await Note.findOne({_id : req.params.id, user:req.user._id});
        if(!note){
            return res.status(404).json({message : "Note not found"});
        }
        res.status(200).json(note);
    }
    catch(err){
        if(err.name === "CastError"){
            return res.status(404).json({message : "Note not found"});
        }
        console.log(err);
        res.status(500).json({message : "Server error"});
    }
};

//DELETE /api/notes/:id-> delete one note
const deleteNote = async (req,res)=>{
    try{
        const note = await Note.findOneAndDelete({_id : req.params.id , user : req.user._id});
        if(!note){
            return res.status(404).json({message : "Note not found"});
        }
        res.status(200).json({message : "Note deleted"});
    }
    catch(err){
        if(err.name === "CastError"){
            return res.status(404).json({message : "Note not found"});
        }
        console.log(err);
        return res.status(500).json({message : "Server error"});
    }
};

//POST /api/notes/:id/summary -> make the summary if it's missing
const createSummary = async (req,res)=>{
    try{
        const note = await Note.findOne({_id: req.params.id , user: req.user._id});
        if(!note){
            return res.status(404).json({message : "Note not found"});
        }

        if(note.summary){
            return res.status(200).json({summary : note.summary});
        }

        note.summary = await makeSummary(note.text);
        await note.save();
        res.status(200).json({summary : note.summary});
    }
    catch(err){
        if(err.name === "CastError"){
            return res.status(404).json({message : "Note not found"});
        }
        console.log(err);
        res.status(502).json({message : "Could not make the summary. Try again later"});
    }
}

//POST /api/notes/:id/quiz -> make the quiz the first time only
const createQuiz = async (req,res) => {
    try{
        const note = await Note.findOne({_id : req.params.id , user : req.user._id});
        if(!note){
            return res.status(404).json({message : "Note not found"});
        }

        //already made -> send the saved note (no Gemini call)
        if(note.quiz.length > 0){
            return res.status(200).json({quiz : note.quiz});
        }

        const quiz = await makeQuiz(note.text);
        if(quiz.length === 0){
            return res.status(502).json({message : "Could not make the quiz. Try again."});
        }

        note.quiz = quiz;
        await note.save();
        res.status(200).json({quiz : note.quiz});
    }
    catch(err){
        if(err.name === "CastError"){
            return res.status(404).json({message : "Note not found"});
        }
        console.log(err);
        res.status(502).json({message : "Could not make the quiz. Try again later."})
    }
};

//POST /api/notes/:id/flashcards -> make the flashcards the first time only
const createFlashcards = async (req,res) =>{
    try{
        const note = await Note.findOne({_id:req.params.id , user : req.user._id});
        if(!note){
            return res.status(404).json({message:"Note not found"});
        }

        if(note.flashcards.length > 0 ){
            return res.status(200).json({flashcards : note.flashcards});
        }

        const flashcards = await makeFlashcards(note.text);
        if(flashcards.length === 0){
            return res.status(502).json({message : "Could not make the flashcards. Try again"});
        }

        note.flashcards = flashcards;
        await note.save();
        res.status(200).json({flashcards : note.flashcards});
    }
    catch(err){
        if(err.name === "CastError"){
            return res.status(404).json({message : "Note not found"});
        }
        console.log(err);
        res.status(502).json({message : "Could not make the flashcards. Try again later"});
    }
}

module.exports = { createNote , getNotes , getNote , deleteNote, createSummary, createQuiz, createFlashcards };