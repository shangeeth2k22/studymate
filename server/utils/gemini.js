const { GoogleGenAI } = require("@google/genai");

const MAX_CHARS = 100000;

const ai = new GoogleGenAI({apiKey : process.env.GEMINI_API_KEY});

const MODEL= process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

//if Gemini is busy (503) or over the limit (429) , wait and try again
const withRetry = async (fn, tries=3) => {
    for(let i=1;i<=tries;i++){
        try{
            return await fn();
        }
        catch(err){
            const busy = err.status === 503 || err.status === 429;
            if(!busy || i === tries) throw err;
            console.log(`Gemini busy (${err.status}), retry ${i}...`);
            await new Promise((r)=> setTimeout(r, 2000*i));
        }
    }
};

const askGemini = async (prompt)=>{
    const response = await withRetry(() =>
     ai.models.generateContent({
        model : MODEL,
        contents : prompt,
    })
  );
    return response.text;
};

const askGeminiJSON = async (prompt ,schema) => {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model : MODEL,
        contents : prompt,
        config : {
            responseMimeType : "application/json",
            responseJsonSchema : schema,
        }
    })
  );
    return JSON.parse(response.text);
}

const makeSummary = async (text)=>{
    const shortText = text.slice(0,MAX_CHARS);

    const prompt = `You are a Study helper for university students.Summarize the notes below
    
    Rules:
    - 5 to 10 short bullet points, each starting with "- "
    - Simple, clear English
    - Use only information from the notes
    - No title and no intro sentence
    - Be exact with numbers, data types and names; if unsure, leave the detail out
    
    Notes:
    ${shortText}`;

    const summary = await askGemini(prompt);
    return summary.trim();
};

const quizSchema = {
    type : "array",
    items : {
        type : "object",
        properties : {
            question : {
                type : "string"
            },
            options : {
                type : "array",
                items : {
                    type : "string",
                }
            },
            answer : {
                type : "string"
            }
        },
        required : ["question" , "options" , "answer"],
        
    }
};

const makeQuiz = async (text) => {
    const prompt = `You are a study helper for university students. Make a multiple-choice quiz from the notes below.
    
    Rules:
    - Exactly 5 questions
    - Each question has exactly 4 options
    - "answer" must be copied exactly from one of the options
    - Only one option is correct
    - Use only information from the notes
    - Simple, clear English
    
    Notes:
    ${text.slice(0,MAX_CHARS)}`;

    const quiz = await askGeminiJSON(prompt , quizSchema);

    return quiz.filter(
        (q) => q.options.length === 4 && q.options.includes(q.answer)
    );
}

const flashcardSchema = {
    type : "array",
    items : {
        type : "object",
        properties : {
            front : {
                type : "string"
            },
            back : {
                type : "string"
            }
        },
        required : ["front", "back"],
    },

};

const makeFlashcards = async (text)=> {
    const prompt = `You are a study helper for university students. Make flashcards from the notes below.
    
    Rules:
    - Exactly 8 flashcards
    - "front" : a key term or a short question (max 12 words)
    - "back" : a short answer (1 or 2 sentences)
    - use only information from the notes
    - Simple, clear English
    
    Notes:
    ${text.slice(0,MAX_CHARS)}`;

    const cards = await askGeminiJSON(prompt, flashcardSchema);
    return cards.filter((c) => c.front && c.back);
}

module.exports = { askGemini, makeSummary, makeQuiz, makeFlashcards };