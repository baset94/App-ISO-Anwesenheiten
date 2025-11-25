const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// CSP-Header für die gesamte App setzen
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://n8n.autoprozessagentur.cloud;"
  );
  next();
});

app.use(express.static('public'));

app.post('/api/trigger-workflow', express.json(), async (req, res) => {
    try {
        const webhookUrl = req.query.webhookUrl;
        
        if (!webhookUrl) {
            return res.status(400).json({ error: 'webhookUrl query parameter is required' });
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(req.body || {})
        });

        const contentType = response.headers.get('content-type');
        
        if (response.status === 401 || response.status === 403) {
            return res.status(401).json({ 
                error: 'Authentifizierung fehlgeschlagen',
                authenticated: false 
            });
        }
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            console.error('Non-JSON response from n8n:', text);
            res.status(response.status).json({ 
                error: 'Unerwartete Antwort vom Server',
                authenticated: false
            });
        }
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

        const headers = {
            'Content-Type': req.headers['content-type'],
            'Content-Length': req.headers['content-length']
        };
        
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        const response = await fetch(resumeUrl, {
            method: 'POST',
            body: req,
            duplex: 'half',
            headers: headers
        });

        const contentType = response.headers.get('content-type');
        
        if (response.status === 401 || response.status === 403) {
            return res.status(401).json({ 
                error: 'Authentifizierung fehlgeschlagen',
                authenticated: false 
            });
        }
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            console.error('Non-JSON response from n8n:', text);
            res.status(response.status).json({ 
                error: 'Unerwartete Antwort vom Server',
                authenticated: false
            });
        }
    } catch (error) {
        console.error('Error resuming workflow:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`App listening at http://0.0.0.0:${port}`);
});
