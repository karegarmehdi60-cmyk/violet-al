import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.OPENROUTER_API_KEY) {
  console.warn("WARNING: OPENROUTER_API_KEY is not set.");
}

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

/* Server status */
app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    keyConfigured: Boolean(process.env.OPENROUTER_API_KEY)
  });
});

/* Violet AI chat */
async function askViolet(messages, res) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing on the server."
      });
    }

    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content:
            "You are Violet AI, a helpful and friendly AI assistant. " +
            "Answer clearly and naturally. " +
            "Reply in the same language as the user. " +
            "If the user asks who created you, answer: Maziar M.K."
        },
        ...messages
      ],
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("The model returned an empty response.");
    }

    return res.json({ reply });

  } catch (error) {
    console.error("OpenRouter error:", error);

    return res.status(500).json({
      error:
        error?.error?.message ||
        error?.message ||
        "OpenRouter request failed."
    });
  }
}

/* New Violet frontend format: { message: "Hello" } */
app.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({
      error: "Message is empty."
    });
  }

  return askViolet(
    [
      {
        role: "user",
        content: message
      }
    ],
    res
  );
});

/* Old/API-compatible format: { messages: [...] } */
app.post("/api/chat", async (req, res) => {
  const incoming = Array.isArray(req.body?.messages)
    ? req.body.messages
    : [];

  const messages = incoming
    .filter(
      m =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-30);

  if (!messages.length) {
    return res.status(400).json({
      error: "No messages were provided."
    });
  }

  return askViolet(messages, res);
});

/* Main page */
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "violet_ai_frontend.html"));
});

/* Start server */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Violet AI is running on port ${PORT}`);
});
