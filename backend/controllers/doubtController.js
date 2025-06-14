const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load your Gemini API key from environment variables (recommended)
const genAI = new GoogleGenerativeAI("AIzaSyBI2JVOeY3Hx70PzykrRsRIcnqMF8vNqCM");

async function solveStudentDoubt(req, res) {
  const { doubt } = req.body;

  if (!doubt || doubt.trim() === "") {
    return res.status(400).send("Doubt cannot be empty.");
  }

  try {
    const prompt = `
You are a knowledgeable and friendly tutor for high school and college students.
Your job is to answer students' academic doubts in a simple, clear, and helpful way.

Student's Doubt:
"${doubt}"

Give a detailed, easy-to-understand explanation.
If it's a math or code problem, show step-by-step solution.
Avoid irrelevant text or markdown formatting.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.send(text);
  } catch (error) {
    console.error("Error solving doubt:", error);
    res.status(500).send("Something went wrong while solving the doubt.");
  }
}

module.exports = { solveStudentDoubt };
