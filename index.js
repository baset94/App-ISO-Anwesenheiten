const express = require('express');
const app = express();
const port = 5000;

app.use(express.static('public'));

app.post('/api/trigger-workflow', express.json(), async (req, res) => {
    try {
        const webhookUrl = req.query.webhookUrl;
        
        if (!webhookUrl) {
            return res.status(400).json({ error: 'webhookUrl query parameter is required' });
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body || {})
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error triggering workflow:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/resume-workflow', async (req, res) => {
    try {
        const resumeUrl = req.query.resumeUrl;
        
        if (!resumeUrl) {
            return res.status(400).json({ error: 'resumeUrl query parameter is required' });
        }

        const response = await fetch(resumeUrl, {
            method: 'POST',
            body: req,
            duplex: 'half',
            headers: {
                'Content-Type': req.headers['content-type'],
                'Content-Length': req.headers['content-length']
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error resuming workflow:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`App listening at http://0.0.0.0:${port}`);
});
