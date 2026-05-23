# 🤖 DODO AI Agent — Cloudflare Edge Assistant

DODO (Diagnostic Operational Drone Organizer) is an advanced edge-based portfolio AI assistant. Powered by **Hono** and **LangChain JS/TS**, it runs on Cloudflare Workers (V8 Isolates) with 0ms cold starts to answer questions, explain accomplishments, and securely route requests to Genesys AI / custom LLM endpoints.

---

## 🚀 Key Features

- **⚡ 0ms Latency (V8 Isolates):** Serverless architecture deployed globally to the Cloudflare edge.
- **🔒 API Key Protection:** Restricts frontend credentials. Your secret `GENAI_KEY` is fully encrypted in Cloudflare Secrets and never exposed in the browser.
- **📚 Embedded RAG Context:** System instructions loaded with complete portfolios, skills, hackathon accomplishments, and research logs for instant local queries.
- **🔄 Streaming Chat (SSE):** Sends response tokens chunk-by-chunk in real time using Server-Sent Events.

---

## 🛠️ Getting Started

### 1. Installation
Install core dependencies locally:
```bash
npm install
```

### 2. Configure Local Credentials
Create a `.dev.vars` file (already in `.gitignore` so it will never leak) to store your keys for local testing:
```env
GENAI_KEY="YOUR_API_TOKEN_HERE"
LLM_BASE_URL="https://your-domain.com/genAI/v1"
LLM_MODEL_NAME="google/gemma-3-12b"
```

### 3. Run Development Server
Spin up wrangler's local edge emulator:
```bash
npm run dev
```
Your local server will start on `http://localhost:8787`.

### 4. Run the Diagnostic Test
To test streaming tokens directly in your terminal, open a separate shell and run:
```bash
node test-stream.js
```

---

## 🌐 Secure Cloudflare Deployment

### 1. Upload the Secret API Key
Upload your production `GENAI_KEY` to Cloudflare's secure hardware vault:
```bash
npx wrangler secret put GENAI_KEY
```
When prompted, paste your live secret key and press Enter.

### 2. Deploy Globally
Deploy your backend live to Cloudflare’s global edge network in 1 click:
```bash
npm run deploy
```

---

## 📂 Architecture Mapping

```
├── src/
│   ├── index.ts        # Hono Server and LangChain pipeline
│   └── prompt.ts       # DODO AI System Prompt & embedded knowledge base
├── package.json        # Dependencies (Hono, LangChain, Wrangler)
├── wrangler.jsonc      # Cloudflare configuration parameters
├── tsconfig.json       # TypeScript options
├── test-stream.js      # Streaming developer test script
└── .dev.vars           # Protected local credentials (local-only)
```
