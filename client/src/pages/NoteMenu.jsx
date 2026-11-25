import { useEffect ,useState } from "react";
import { Link , useNavigate , useParams } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import formatDate from "../utils/formatDate";
import "./NoteMenu.css";

function NoteMenu(){
    const { id } = useParams();  // the :id from /notes/:id
    const navigate = useNavigate();
    const [note , setNote] = useState(null);
    const [loading , setLoading] = useState(true);
    const [deleting , setDeleting] = useState(false);
    const [error , setError] = useState("");

    useEffect(() => {
        const loadNote = async () => {
            try{
                const res = await api.get(`/notes/${id}`);
                setNote(res.data);
            }
            catch(err){
                setError(err.response?.data?.message || "Could not load the note");
            }
            finally{
                setLoading(false);
            }
        };
        loadNote();
    },[id]);

    const handleDelete = async () =>{
        const ok = window.confirm(`Delete "${note.title}"? This can't be undone`);
        if(!ok){
            return;
        }

        setDeleting(true);
        setError("");
        try{
            await api.delete(`/notes/${id}`);
            navigate("/");
        }
        catch(err){
            setError(err.response?.data?.message || "Could not delete the note");
            setDeleting(false);
        }
    };

    if(loading){
        return(
            <>
                <Header />
                <main className="page">
                    <p className="muted">Loading...</p>
                </main>
            </>
        );
    }

    //wrong id,someone else's note -> backend sent 404
    if(!note){
        return(
            <>
                <Header />
                <main className="page">
                    <p className="error">{error}</p>
                    <Link to="/" className="back-link"> ← Back to My Notes</Link>
                </main>
            </>
        )
    }

    return(
        <>
            <Header />
            <main className="page menu">
                <Link to="/" className="back-link">← My Notes</Link>

                <h2 className="menu-title">{note.title}</h2>
                <p className="muted">Added {formatDate(note.createdAt)}</p>

                <div className="menu-buttons">
                    <Link to={`/notes/${id}/summary`} className="menu-btn">📝 Summary</Link>
                    <Link to={`/notes/${id}/quiz`} className="menu-btn" >❓ Quiz</Link>
                    <button className="menu-btn" disabled>🃏 Flashcards</button>
                </div>

                {error && <p className="error">{error}</p>}

                <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete note"}
                </button>
            </main>
        </>
    );

}

export default NoteMenu;