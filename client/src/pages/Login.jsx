import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import api from "../api";
import "./Auth.css";

function Login(){
    const [email ,setEmail] = useState("");
    const [password , setPassword] = useState("");
    const [error , setError] = useState("");
    const [loading , setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault(); // stops browser from reloading the page
        setError("");

        if(!email || !password){
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try{
            const res = await api.post("/auth/login", {email,password});

            localStorage.setItem("token",res.data.token);
            localStorage.setItem("user",JSON.stringify(res.data.user));

            navigate("/"); //go to Home
        }
        catch(err){
            //show the backend's message, e.g "Invalid email and password"
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
                <h2>Login</h2>

                {error && <p className="auth-error">{error}</p>}

                <label htmlFor="email">Email</label>
                <input 
                  id = "email"
                  type = "email"
                  placeholder ="you@example.com"
                  value={email}
                  onChange={(e)=> setEmail(e.target.value)}
                  
                />

                <label htmlFor="password">Password</label>
                <input 
                    id = "password"
                    type = "password"
                    placeholder="Your password"
                    value = {password}
                    onChange={(e)=> setPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </form>

        </div>
    );
}

export default Login;