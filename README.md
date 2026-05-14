# DeciMatrix

Expo + React Native app with a minimal Vercel backend for AI criteria suggestions.

## Backend Endpoint

`POST /api/suggest-criteria`

Request body:

```json
{
  "decisionTitle": "Какой ноутбук купить?",
  "options": ["MacBook Air", "ASUS Zenbook"],
  "existingCriteria": ["Цена"]
}
```

Response:

```json
{
  "criteria": ["Цена", "Батарея", "Вес"]
}
```

## Environment

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Add your OpenRouter key:

```bash
OPENROUTER_API_KEY=your_key_here
```

Do not commit `.env`.

## Run Locally

Install dependencies:

```bash
npm install
```

Run the Expo app:

```bash
npm start
```

Run Vercel functions locally:

```bash
npx vercel dev
```

## Test Endpoint

```bash
curl -X POST http://localhost:3000/api/suggest-criteria \
  -H "Content-Type: application/json" \
  -d '{
    "decisionTitle": "Какой ноутбук купить?",
    "options": ["MacBook Air M4", "ASUS Zenbook", "Lenovo ThinkPad"],
    "existingCriteria": ["Цена"]
  }'
```

Expected response:

```json
{
  "criteria": ["...", "..."]
}
```

## Deploy To Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add environment variable `OPENROUTER_API_KEY` in Vercel Project Settings.
4. Deploy.

After deploy, test:

```bash
curl -X POST https://your-vercel-domain.vercel.app/api/suggest-criteria \
  -H "Content-Type: application/json" \
  -d '{
    "decisionTitle": "Какой ноутбук купить?",
    "options": ["MacBook Air M4", "ASUS Zenbook"]
  }'
```
