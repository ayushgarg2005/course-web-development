import express from 'express';
import axios from 'axios';
import { NGROK_CHAT_URL } from '../config/config.js';

const router = express.Router();

// POST /chat
router.post('/chat', async (req, res) => {
  const { query, context } = req.body;

  if (!NGROK_CHAT_URL) {
    return res.status(503).json({ error: 'Chat service URL not configured' });
  }

  try {
    const response = await axios.post(`${NGROK_CHAT_URL}/api/chat`, { query, context });
    res.json({ response: response.data.response });
  } catch (error) {
    console.error('Chat proxy error:', error.message);
    res.status(500).json({ error: 'Failed to reach chat service' });
  }
});

export default router;