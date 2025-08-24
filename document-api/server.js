// -------------------- Gemini Setup --------------------
const { VertexAI } = require('@google-cloud/vertexai');
const projectId = 'your-google-cloud-project-id'; // Replace with your project ID
const location = 'us-central1'; // Or your preferred region
const vertexAI = new VertexAI({ project: projectId, location: location });
const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// -------------------- Express Setup --------------------
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const rateLimit = require('express-rate-limit');
const axios = require("axios");   // ✅ sirf ek jagah import

const app = express();
const port = 3000;

app.use(express.json());

// Multer for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/qa', limiter);

// -------------------- Root Route --------------------
app.get("/", (req, res) => {
  res.send("✅ Server is working! 🚀");
});

// -------------------- Q&A Endpoint --------------------
app.post('/qa', upload.single('pdf'), async (req, res) => {
    try {
        // Extract text from PDF (if provided) or use body text
        let text = req.body.text || '';
        if (!text && req.file) {
            const dataBuffer = req.file.buffer;
            const pdfData = await pdfParse(dataBuffer);
            text = pdfData.text;
        }
        if (!text) {
            return res.status(400).json({ error: 'No text or PDF provided' });
        }

        // Get question
        const question = req.body.question;
        if (!question) {
            return res.status(400).json({ error: 'No question provided' });
        }

        // Call Gemini API for Q&A
        const prompt = `Based on the following document, answer this question: ${question}\n\nDocument: ${text}`;
        const response = await generativeModel.generateContent(prompt);
        const answer = response.response.candidates[0].content.parts[0].text;

        // Send response
        res.json({
            success: true,
            question: question,
            answer: answer
        });
    } catch (error) {
        console.error('Q&A Error:', error);
        res.status(500).json({ error: 'Q&A processing failed' });
    }
});

// -------------------- Python API Endpoint --------------------
app.post("/use-python", async (req, res) => {
  try {
    const { text } = req.body;

    // Send request to Python backend (FastAPI)
    const response = await axios.post("http://127.0.0.1:8000/process", { text });

    res.json({
      success: true,
      pythonResponse: response.data
    });
  } catch (err) {
    console.error("Python API Error:", err.message);
    res.status(500).json({ error: "Python backend error" });
  }
});

// -------------------- Start Server --------------------
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
