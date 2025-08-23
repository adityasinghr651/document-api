const { VertexAI } = require('@google-cloud/vertexai');
const projectId = 'your-google-cloud-project-id'; // Replace with your project ID
const location = 'us-central1'; // Or your preferred region
const vertexAI = new VertexAI({ project: projectId, location: location });
const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use Gemini model





const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const app = express();
const port = 3000;

// Multer for in-memory file handling (secure, no disk storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Q&A Endpoint
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

        // Get question from request body
        const question = req.body.question;
        if (!question) {
            return res.status(400).json({ error: 'No question provided' });
        }

        // Call Gemini API for Q&A
        const prompt = `Based on the following document, answer this question: ${question}\n\nDocument: ${text}`;
        const response = await generativeModel.generateContent(prompt);
        const answer = response.response.candidates[0].content.parts[0].text;

        // Return clean JSON response
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

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});




const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/qa', limiter);