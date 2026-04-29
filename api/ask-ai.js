export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const GEMINI_KEY = process.env.GEMINI_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`;

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
    })
  });

  const data = await upstream.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  res.status(200).json({ text });
}
