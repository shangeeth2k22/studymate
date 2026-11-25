import { useEffect, useState } from "react";
import { Link , useParams } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import "./Quiz.css";

function Quiz(){
    const { id } = useParams();
    const [quiz , setQuiz] = useState([]);
    const [answers , setAnswers] = useState({}); // questionID : choose option
    const [submitted , setSubmitted] = useState(false);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");

    //get the quiz (Gemini makes it the first time)
    useEffect(()=>{
        const loadQuiz = async () => {
            try{
                const res = await api.post(`/notes/${id}/quiz`);
                setQuiz(res.data.quiz);
            }
            catch(err){
                setError(err.response?.data?.message || "Could not load the quiz");
            }
            finally{
                setLoading(false);
            }
        };
        loadQuiz();
    },[id]);

    //choose an option (locked after submit)
    const choose = (qId , option) =>{
        if(submitted){
            return;
        }
        setAnswers({...answers,[qId] : option});
    };

    const allAnswered = Object.keys(answers).length === quiz.length;
    const score = quiz.filter((q) => answers[q._id] === q.answer).length;

    const restart = ()=> {
        setAnswers({});
        setSubmitted(false);
        window.scrollTo(0,0);
    }

    //pick the color of each option
    const optionClass = (q, option) =>{
        if(!submitted){
            return answers[q._id] === option ? "option selected" : "option";
        }

        if(option === q.answer){
            return "option correct";
        }
        if(answers[q._id] === option){
            return "option wrong";
        }

        return "option";
    };

    if(loading){
        return (
            <>
                <Header/>
                <main className="page">
                    <p className="muted">Making your quiz... this can take few seconds.</p>
                </main>
            </>
        );
    }

    if(error){
        return(
            <>
                <Header/>
                <main className="page">
                    <Link to={`/notes/${id}`} className="back-link">← Back</Link>
                    <p className="error">{error}</p>
                    <button className="btn-primary" onClick={()=> window.location.reload()}>
                        Try again
                    </button>
                </main>
            </>
        );
    }

    return(
        <>
            <Header/>
            <main className="page quiz">
                <Link to={`/notes/${id}`} className="back-link">← Back</Link>
                <h2>Quiz</h2>

                {quiz.map((q,i)=>(
                    <div key={q._id} className="question-card">
                        <p className="question">{i+1}. {q.question}</p>
                        <div className="options">
                            {q.options.map((option,j)=>(
                                <button
                                   key = {j}
                                   className={optionClass(q,option)}
                                   onClick={()=> choose(q._id, option)}
                                   disabled ={submitted}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {submitted ? (
                    <div className="score-box">
                        <p className="score">You got {score} / {quiz.length}</p>
                        <button className="btn-primary" onClick={restart}>Try again</button>
                    </div>
                ) : (
                    <button className="btn-primary" onClick={()=> setSubmitted(true)} disabled={!allAnswered}>
                        Submit
                    </button>
                )
                }
            </main>
        </>
    )
}

export default Quiz;