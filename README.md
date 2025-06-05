# Albert Diversity Bot

This repository contains **Albert**, a multilingual chatbot that helps university lecturers reflect on classroom diversity scenarios. The project is split into a React frontend and an Express backend that communicates with the OpenAI API and stores chat logs in Supabase.

## Project structure

```
/backend   Node.js + Express server
/frontend  React app (Vite + Tailwind)
```

## Setup

1. **Clone the repository** and install dependencies in both `frontend` and `backend`:

```bash
npm install        # run in ./backend
npm install        # run in ./frontend
```

2. **Environment variables** – copy `backend/env.example` to `backend/.env` and fill in your Supabase and OpenAI keys.

```
cp backend/env.example backend/.env
```

3. **Run locally**

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

The frontend will send requests to `/chat`. Adjust the proxy or full URL when deploying on Render.

## Deployment

- Deploy the **backend** on Render as a Node service. Make sure the `.env` variables are configured in Render's dashboard.
- Deploy the **frontend** as a separate static site on Render. Point the API requests to the backend URL.
- Supabase should already contain a table named `chat_logs` with columns `session_id`, `message`, `sender` and automatic `timestamp`.

## Usage

1. Navigate to the deployed frontend.
2. A welcome message from Albert appears first.
3. Type any message to receive the first scenario. Reply in Hebrew, Arabic or English. Albert will continue the conversation in the detected language and store messages in Supabase.

Each answer from Albert is a short question designed to deepen reflection on the scenario. Use `"next"` (or "עבור לתרחיש הבא" / "التالي") to move forward.
