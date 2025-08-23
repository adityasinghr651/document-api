app.post('/upload-and-summarize', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF uploaded' });
        }

        // Extract text from PDF (in memory)
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        // Summarize using Vertex AI (Gemini)
        const prompt = `Summarize the following document in 200-300 words:\n\n${text}`;
        const response = await generativeModel.generateContent(prompt);
        const summary = response.response.candidates[0].content.parts[0].text;

        // Clean JSON response
        res.json({
            success: true,
            originalTextLength: text.length,
            summary: summary
        });

        // No storage: Text and file are discarded here
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Processing failed' });
    }
});