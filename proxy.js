const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());   

// Health check endpoint 
app.get('/health', (req, res) => {  
  res.json({ status: 'ok' });  
});

app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', 
      headers: {   
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }, 
      body: JSON.stringify({ 
        model: "llama-3.3-70b-versatile",  
        max_tokens: req.body.max_tokens || 1200,  
        messages: req.body.messages
      })  
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Return in Anthropic-compatible format
    res.json({
      content: [{ type: "text", text }]
    });
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => {
  console.log('');
  console.log('✅ Career Navigator AI Proxy running!');
  console.log('   URL: http://localhost:3001');
  console.log('   AI:  Groq llama-3.3-70b-versatile');
  console.log('');
});