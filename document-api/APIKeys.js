app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'your-secret-key') { // Replace with env var
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});