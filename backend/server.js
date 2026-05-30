require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/discover', async (req, res) => {
  const { subjects, hobbies, strengths, fields, environment, skills, freetext } = req.body;

const prompt = `You are a career counsellor for students in India (especially Kerala). Based on this student's profile, suggest 4 suitable job roles.

IMPORTANT RULES:
- If the student has selected a field they want to work in (e.g. IT), suggest roles IN that field even if they have zero experience yet
- Treat their field interest as their goal, and their current skills/hobbies as their starting point
- Always suggest a beginner-friendly entry role if they are just starting out

Profile:
- Favourite subjects: ${subjects?.join(', ') || 'not specified'}
- Hobbies: ${hobbies?.join(', ') || 'not specified'}
- Strengths: ${strengths?.join(', ') || 'not specified'}
- Fields they want to work in: ${fields?.join(', ') || 'not specified'}
- Work environment: ${environment?.join(', ') || 'not specified'}
- Skills already learned: ${skills?.join(', ') || 'not specified'}
- In their own words: ${freetext || 'nothing added'}

Respond ONLY with valid JSON, no markdown, no extra text:
{"summary":"2-3 sentences warm personal insight","roles":[{"title":"Job Role","domain":"Field","match":92,"why":"2 sentences why this fits them personally","skills_to_learn":["skill1","skill2","skill3"]}]}`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

const raw = data.choices?.[0]?.message?.content || '';
const match = raw.match(/\{[\s\S]*\}/);
if (!match) throw new Error('No JSON found in response');
const parsed = JSON.parse(match[0]);

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));