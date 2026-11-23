import { useEffect , useRef , useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import api from "../api";
import "./Home.css";

//"2026-11-23T07:00:00Z" -> "23 Nov 2026"
const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB",{
        day : "numeric",
        month : "short",
        year : "numeric"
    });


function Home() {
    const [notes,setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading , setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInput = useRef(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    //load my notes once, when the page opens
    useEffect(()=>{
        const loadNotes = async ()=>{
            try{
                const res = await api.get("/notes");
                setNotes(res.data);
            }
            catch(err){
                //token expired or wrong ->logout
                if(err.response?.status === 401){
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }
                setError(err.response?.data?.message || "Could not load your notes");
            }
            finally{
                setLoading(false);
            }
        }
        loadNotes();
    },[navigate]);

    //runs after user picks a file
    const handleFile = async (e)=>{
        const file = e.target.files[0];
        e.target.value = ""; 
        if (!file) {
            return;
        }

        setError("");

        if(file.size > 5 * 1024 * 1024){
            setError("File is too large (max 5MB)");
            return;
        }

        setUploading(true);
        try{
            const formData = new FormData();
            formData.append("pdf" , file); // "pdf" must match upload.single("pdf")

            const res = await api.post("/notes", formData);

            //add the new data to the top of the list
            const newNote = {
                _id : res.data.id,
                title : res.data.title,
                createdAt : res.data.createdAt
            };

            setNotes([newNote , ...notes]);

        }
        catch(err){
            setError(err.response?.data?.message || "Upload failed");
        }
        finally{
            setUploading(false);
        }
    }

    return(
        <div className="home">
            <header className="home-header">
                <h1 className="home-logo">StudyMate</h1>
                <div className="home-user">
                    <span>Hi, {user?.name}</span>
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </header>

            <main className="home-main">
                <div className="home-top">
                    <h2>My Notes</h2>
                    <button
                        className="btn-primary"
                        onClick={()=> fileInput.current.click()}
                        disabled = {uploading}
                        >
                        {uploading ? "Processing..." : "+ upload pdf"}
                        </button>
                    
                    {/* hidden file picker, opened by the button above*/}
                    <input 
                        type="file"
                        accept="application/pdf"
                        ref = {fileInput}
                        onChange={handleFile}
                        hidden />
                </div>

                {error && <p className="home-error">{error}</p>}

                {loading ? (
                    <p className="home-muted">Loading notes...</p>
                ) : notes.length === 0 ? (
                    <p className="home-muted">No notes yet. Upload a pdf to start</p>
                ) : (
                    <div className="note-list">
                        {notes.map((note)=> (
                            <Link to={`/notes/${note._id}`} className="note-card" key = {note._id}>
                            <h3>{note.title}</h3>
                            <p>Added {formatDate(note.createdAt)}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );

}

export default Home;