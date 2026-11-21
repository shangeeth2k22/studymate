const { GoogleGenAI } = require("@google/genai");

const MAX_CHARS = 100000;

const ai = new GoogleGenAI({apiKey : process.env.GEMINI_API_KEY});

const MODEL= process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const askGemini = async (prompt)=>{
    const response = await ai.models.generateContent({
        model : MODEL,
        contents : prompt,
    });
    return response.text;
};

const makeSummary = async (text)=>{
    const shortText = text.slice(0,MAX_CHARS);

    const prompt = `You are a Study helper for university students.Summarize the notes below
    
    Rules:
    - 5 to 10 short bullet points, each starting with "- "
    - Simple, clear English
    - Use only information from the notes
    - No title and no into sentence
    - Be exact with numbers, data types and names; if unsure, leave the detail out
    
    Notes:
    ${shortText}`;

    const summary = await askGemini(prompt);
    return summary.trim();
};

module.exports = { askGemini, makeSummary };