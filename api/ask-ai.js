export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  const HF_TOKEN = process.env.HF_TOKEN;

  try {
    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_TOKEN}`
        },
        body: JSON.stringify({
          model: 'microsoft/Phi-4-mini-instruct:nebius', // ← provider suffix is required
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7
        })
      }
    );

    // Log the raw text first to debug any future issues
    const rawText = await response.text();

    if (!response.ok) {
      console.error('HF API error:', response.status, rawText);
      return res.status(500).json({ text: `AI error ${response.status}: ${rawText.slice(0, 200)}` });
    }

    const data = JSON.parse(rawText);
    const raw = data?.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();

    res.status(200).json({ text: clean });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ text: 'Server error: ' + err.message });
  }
}
