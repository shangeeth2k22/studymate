import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

function Header(){
    const navigate = useNavigate();
    const { pathname } = useLocation(); //current url
    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () =>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return(
        <header className="header">
            <Link to="/" className="header-logo">StudyMate</Link>
            <div className="header-right">
                <span>Hi {user?.name}</span>
                {/* no need to Home button when you are already in Home*/}
                {pathname !== "/" && <Link to="/" className="btn-outline">Home</Link>}
                <button className="btn-outline" onClick={logout}>Logout</button>
            </div>
        </header>
    );
}

export default Header;