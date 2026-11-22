import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./Auth.css";

function Signup(){
    const [name , setName] = useState("");
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading , setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError("");
    

        if(!name||!email||!password){
            setError("Please fill in all fields");
            return;
        }

        if(password.length < 6){
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try{
             const res = await api.post("/auth/register", {name ,email,password} );

            localStorage.setItem("token",res.data.token);
            localStorage.setItem("user",JSON.stringify(res.data.user));

             navigate("/");
        }   
        catch(err){
             // e.g "Email already registered"
            setError(err.response?.data?.message || "Something went wrong");
        }
        finally{
             setLoading(false);
        }
    };

return(
    <div className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit}>
            <h1 className="auth-logo">StudyMate</h1>
            <h2>Sign Up</h2>

            {error && <p className="auth-error">{error}</p>}

            <label htmlFor="name">Name</label>
            <input
                 id = "name"
                 type = "text"
                 placeholder="Your name"
                 value ={name}
                 onChange={(e)=> setName(e.target.value)}
                  />

            <label htmlFor="email">Email</label>
            <input
                 id = "email"
                 type = "email"
                 placeholder="you@example.com"
                 value ={email}
                 onChange={(e)=> setEmail(e.target.value)}
                  />

            <label htmlFor="password">Password</label>
            <input 
               id= "password"
               type = "password"
               placeholder="At least 6 characters"
               value = {password}
               onChange={(e)=> setPassword(e.target.value)}
                />

            <button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="auth-switch">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </form>

    </div>
);
}

export default Signup;
