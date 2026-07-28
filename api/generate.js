export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Falta la GROQ_API_KEY en las variables de entorno de Vercel.' });
    }

    const { systemPrompt, userPrompt } = req.body || {};

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'Error al comunicarse con la API de Groq' 
            });
        }

        const gameData = JSON.parse(data.choices[0].message.content);
        return res.status(200).json(gameData);

    } catch (err) {
        return res.status(500).json({ error: 'Error interno en el servidor: ' + err.message });
    }
}
