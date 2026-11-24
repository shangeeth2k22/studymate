import { useEffect, useState } from "react";
import { Link , useParams } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import "./Summary.css";

// "- point one\n -point two" -> ["point one" , "point two"]
const toPoints = (text) =>
    text
        .split("\n")
        .map((line) => line.trim())
        .filter((line)=> line !== "")
        .map((line) => line.replace(/^[-*•]\s+/, "").replaceAll("**", ""));

function Summary() {
    const { id } = useParams();
    const [note , setNote] = useState(null);
    const [loading , setLoading] = useState(true);
    const [making , setMaking] = useState(false);
    const [error, setError] = useState("");

    useEffect(()=>{
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
        }
        loadNote();
    },[id]);

    //Try again -> POST /api/notes/:id/summary
    const makeSummary = async () =>{
        setError("");
        setMaking(true);
        try{
            const res = await api.post(`/notes/${id}/summary`);
            setNote({...note, summary: res.data.summary});  // new object -> react re renders
        }
        catch(err){
            setError(err.response?.data?.message || "Could not make the summary")
        }
        finally{
            setMaking(false);
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
        )
    }

    if(!note){
        return(
            <>
                <Header />
                <main className="page">
                    <p className="error">{error}</p>
                    <Link to="/" className="back-link"> ← Back to My Notes</Link>
                </main>
            </>
        );
    }

    const points = toPoints(note.summary || "");

    return(
        <>
            <Header />
            <main className="page summary">
                <Link to={`/notes/${id}`} className="back-link">← Back</Link>

                <h2>Summary</h2>
                <p className="muted">{note.title}</p>

                <div className="summary-box">
                    {points.length > 0 ? (
                        <ul className="summary-list">
                            {points.map((point,i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                        ) : (
                            <div className="summary-empty">
                                <p>No summary yet. The AI may have been busy when you upload this note.</p>
                                <button className="btn-primary" onClick={makeSummary} disabled={making}>
                                    {making? "Making summary..." : "Try again"}
                                </button>
                            </div>
                        )}
                </div>

                {error && <p className="error">{error}</p>}
            </main>
        </>
    )
}

export default Summary;