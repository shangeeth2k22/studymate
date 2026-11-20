const { PDFParse } = require("pdf-parse");
const Note = require("../models/Note");

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

        res.status(201).json({
            id : note._id,
            title : note.title,
            createdAt : note.createdAt,
            preview : text.slice(0,200),
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : "Server error"});
    }
};

module.exports = { createNote };