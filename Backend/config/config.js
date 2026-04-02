import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET_KEY     = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const PORT               = process.env.PORT || 3000;
export const MONGO_URI          = process.env.MONGO_URI;
export const NGROK_CHAT_URL     = process.env.NGROK_CHAT_URL; // move hardcoded URL here