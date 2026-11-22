const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET , {expiresIn : "7d"});
};

const register = async (req,res) =>{
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message : "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({message : "Password must be atleast 6 characters"});
        }

        const exists = await User.findOne({email : email.toLowerCase().trim()});
        if(exists){
            return res.status(409).json({message : "Email already registered"});
        }

        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({name,email,password:hashed});

        res.status(201).json({
            token : createToken(user._id),
            user : { id : user._id , name : user.name , email : user.email},
        });

    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Server error"});
    }
};

const login = async (req,res)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({message : "Email and Password are required"});
        }

        const user = await User.findOne({email : email.toLowerCase().trim()});
        if(!user){
            return res.status(401).json({message : "Invalid email or password"})
        }

        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({message: "Invalid email or password"});
        }

        res.status(200).json({
            token : createToken(user._id),
            user : {id : user._id , name : user.name , email : user.email}
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : "Server Error"});
    }
};

const getMe = (req,res) =>{
    res.status(200).json({user : req.user});
}

module.exports = { register,login,getMe };