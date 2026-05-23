import { Hono } from "hono";
import { cors } from "hono/cors";
import { promptFallback } from "./promptFallback";
import { cmsApp } from "./cms";

type Bindings = {
  GENAI_KEY: string;
  LLM_BASE_URL?: string;
  LLM_MODEL_NAME?: string;
  CMS_AUTH_TOKEN?: string;
  GITHUB_PAT?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Configure CORS dynamically to allow your portfolio domain and local dev environment
app.use(
  "/*",
  cors({
    origin: (origin) => {
      // Allow localhost for development and your official github pages portfolio URL
      if (
        !origin ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin === "https://rathoreatri03.github.io"
      ) {
        return origin;
      }
      return "https://rathoreatri03.github.io"; // Default fallback
    },
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    credentials: true,
  })
);

// Register all CMS endpoints after CORS is set up
app.route("/", cmsApp);

// 2. Health & Diagnostic Check
app.get("/api/health", (c) => {
  const envKeys = c.env ? Object.keys(c.env) : [];
  const keyType = typeof c.env.GENAI_KEY;
  const keyLength = c.env.GENAI_KEY ? c.env.GENAI_KEY.length : 0;
  const keyPrefix = c.env.GENAI_KEY ? c.env.GENAI_KEY.substring(0, 4) : "";
  return c.json({
    status: "online",
    system: "DODO Core Agent",
    uptime: "24/7",
    env_keys: envKeys,
    key_type: keyType,
    key_length: keyLength,
    key_prefix: keyPrefix,
    compatibility: c.env.GENAI_KEY ? "verified" : "missing_key",
  });
});

// 3. Direct Streaming Proxy Endpoint
app.post("/api/chat", async (c) => {
  try {
    const { messages, model } = await c.req.json<{
      messages: { role: string; content: string }[];
      model?: string;
    }>();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Invalid parameters. 'messages' array is required." }, 400);
    }

    const apiKey = c.env.GENAI_KEY;
    if (!apiKey) {
      return c.json({ error: "System Configuration Error: Server API credentials are not initialized." }, 500);
    }

    const baseURL = c.env.LLM_BASE_URL || "https://your-domain.com/genAI/v1"; 
    const modelName = model || c.env.LLM_MODEL_NAME || "google/gemma-3-12b";

    // Build downstream endpoint path
    const targetURL = `${baseURL}/chat/completions`;

    // Fetch the latest system prompt dynamically from GitHub
    let dynamicSystemPrompt = promptFallback; // High-quality local static fallback compiled from portfolio JSONs!
    try {
      const promptRes = await fetch(`https://raw.githubusercontent.com/Rathoreatri03/Protfolio_website/Json_data/dodo_prompt.json?t=${Date.now()}`);
      if (promptRes.ok) {
        const promptData = await promptRes.json() as { system_prompt?: string | string[] };
        if (promptData?.system_prompt) {
          if (Array.isArray(promptData.system_prompt)) {
            dynamicSystemPrompt = promptData.system_prompt.join("\n");
          } else {
            dynamicSystemPrompt = promptData.system_prompt;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic prompt from GitHub, using local fallback.", e);
    }

    // Inject system portfolio instructions at the absolute start of the conversation history
    const downstreamMessages = [
      { role: "system", content: dynamicSystemPrompt },
      ...messages
    ];

    // Make the exact downstream POST request
    const response = await fetch(targetURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "GENAI_KEY": apiKey,
      },
      body: JSON.stringify({
        model: modelName,
        messages: downstreamMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return c.json({ 
        error: `Downstream LLM server returned status ${response.status}: ${errorText}`
      }, response.status as any);
    }

    // Get the reader from the fetch stream
    const reader = response.body?.getReader();
    if (!reader) {
      return c.json({ error: "Response body is not readable." }, 500);
    }

    // Pipe the response bytes directly!
    const body = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err: any) {
          console.error("Stream pipe error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Content-Type-Options": "nosniff",
      }
    });

  } catch (err: any) {
    return c.json({ error: err.message || "Unknown error occurred" }, 500);
  }
});

export default app;
