import { useEffect, useState } from "react";
import { Link , useParams } from "react-router-dom"
import api from "../api";
import Header from "../components/Header";
import "./Flashcards.css";

function Flashcards(){
    const { id } = useParams();
    const [cards , setCards] = useState([]);
    const [index , setIndex] = useState(0);  
    const [flipped, setFlipped] = useState(false); // false = front , true = back;
    const [loading , setLoading] = useState(true);
    const [error, setError] = useState("");

    //get the flashcards ( Gemini makes them the first time )
    useEffect(()=>{
        const loadCards = async ()=>{
            try{
                const res = await api.post(`/notes/${id}/flashcards`);
                setCards(res.data.flashcards);
            }
            catch(err){
                setError(err.response?.data?.message || "Could not load the flashcards");
            }
            finally{
                setLoading(false);
            }
        }
        loadCards();
    },[id]);

    // move to another card always showing its front
    const goTo = (newIndex) => {
        setIndex(newIndex);
        setFlipped(false);
    };

    const isLast = index === cards.length-1;

    if(loading){
        return(
            <>
                <Header />
                <main className="page">
                    <p className="muted">Making your flashcards... this can take a few seconds</p>
                </main>
            </>
        )
    }

    if(error || cards.length === 0){
        return(
            <>
                <Header/>
                <main className="page">
                    <Link to={`/notes/${id}`} className="back-link">← Back</Link>
                    <p className="error">{error || "No flashcards found"}</p>
                    <button className="btn-primary" onClick={()=> window.location.reload()}>
                        Try again
                    </button>
                </main>
            </>
        );
    }

    const card = cards[index];

    return(
        <>
            <Header/>
            <main className="page flashcards">
                <Link to={`/notes/${id}`} className="back-link">← Back</Link>
                <h2>Flashcards</h2>
                <p className="muted">
                    Card {index+1} of {cards.length} . click the card to flip it
                </p>

                <button
                    className={flipped ? "flashcard flipped" : "flashcard"}
                    onClick={()=>setFlipped(!flipped)}                
                >
                    <span className="card-label">{flipped ? "Answer" : "Question"}</span>
                    <span className="card-text">{flipped ? card.back : card.front }</span>

                </button>

                <div className="card-nav">
                    <button className="btn-primary" onClick={()=> goTo(index-1)} disabled={index === 0}>
                        ← Previous
                    </button>

                    <button className="btn-primary" onClick={()=> goTo(isLast ? 0 : index+1)}>
                        {isLast ? "Start again" : "Next"}
                    </button>
                </div>

            </main>
        </>
    );
}

export default Flashcards;