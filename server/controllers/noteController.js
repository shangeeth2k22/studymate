const { PDFParse } = require("pdf-parse");
const Note = require("../models/Note");
const { makeSummary } = require("../utils/gemini");

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

        note.summary = await makeSummary(text);
        await note.save();

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

module.exports = { createNote , getNotes , getNote , deleteNote };