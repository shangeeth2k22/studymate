import { useEffect , useRef , useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import formatDate from "../utils/formatDate";
import "./Home.css";

function Home() {
    const [notes,setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading , setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInput = useRef(null);

    //load my notes once, when the page opens
    useEffect(()=>{
        const loadNotes = async ()=>{
            try{
                const res = await api.get("/notes");
                setNotes(res.data);
            }
            catch(err){
                setError(err.response?.data?.message || "Could not load your notes");
            }
            finally{
                setLoading(false);
            }
        }
        loadNotes();
    },[]);

    //runs after user picks a file
    const handleFile = async (e)=>{
        const file = e.target.files[0];
        e.target.value = ""; 
        if (!file) {
            return;
        }

        setError("");

        if(file.size > 4 * 1024 * 1024){
            setError("File is too large (max 4MB)");
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
            <Header />

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