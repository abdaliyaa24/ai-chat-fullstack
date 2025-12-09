import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { openai } from './openaiClient';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 💡 ВАЖНО: cors() — вызываем функцию
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: message,
    });

    res.json({ reply: response.output[0].content[0].text });
  } catch (error: any) {
    console.error('OpenAI error:', error);
    res.status(500).json({
      error: 'OpenAI request failed',
      details: error?.message || 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
