# AI Chat Starter

This repository is a simple example of a full‑stack project using GPT‑4o.
It contains a minimal Express backend and a small React frontend.

```
/backend   Node.js server exposing `/api/chat`
/frontend  React application built with Vite
```

## Setup

1. Install dependencies for each part:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Copy environment variables and provide your OpenAI key:

```bash
cp ../backend/env.example ../backend/.env
# edit backend/.env and set OPENAI_API_KEY
```

3. Start both services for development:

```bash
cd backend && npm start
# in a second terminal
cd frontend && npm run dev
```

The frontend will send requests to `http://localhost:3001/api/chat` by default.

## Deploy

Deploy the backend and frontend on your preferred platform as two separate services.
Remember to set the `OPENAI_API_KEY` environment variable in the backend.
