// src/lib/config.ts

// IMPORTANT: Ensure this is an absolute URL to avoid Next.js middleware/routing issues.
// If you are running locally and want to hit a local backend, set this to http://localhost:5000/api/admin
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://transport-share-backend.onrender.com/api/admin';

export const WS_BASE  = process.env.NEXT_PUBLIC_WS_URL || 'wss://transport-share-backend.onrender.com/api';
