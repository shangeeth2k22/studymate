const multer = require("multer");

const upload = multer({
    storage : multer.memoryStorage(),
    limits : { fileSize : 4 * 1024 * 1024},
    fileFilter : (req,file,cb)=>{
        if(file.mimetype === "application/pdf"){
            cb(null,true);
        }
        else{
            cb(new Error("Only PDF files are allowed"));
        }
    },
});

const uploadPdf = (req,res,next)=>{
    upload.single("pdf")(req,res, (err)=>{
        if(err){
            return res.status(400).json({message : err.message});
        }
        next();
    });
};

module.exports = uploadPdf;