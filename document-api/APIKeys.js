app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'AIzaSyAQ2-0CT0QoJsZaJb40MpbkOaq_LyDvypU') { // Replace with env var
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});