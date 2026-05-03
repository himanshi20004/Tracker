const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubt = async (req, res) => {
    try {
        const { doubt } = req.body;

        if (!doubt) {
            return res.status(400).json({ error: "Please provide a doubt/question." });
        }

        // Initialize Gemini (Ensure your API Key is in .env)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use gemini-1.5-flash for fast, efficient study assistance
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

        const prompt = `You are a helpful AI Tutor. Provide a clear, step-by-step explanation for the following student doubt: \n\n ${doubt}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Returning the answer in the format your frontend expects
        res.status(200).json({
            success: true,
            answer: text
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ 
            success: false, 
            answer: "⚠️ The AI tutor is currently resting. Please try again in a moment." 
        });
    }
};

module.exports = { solveDoubt };