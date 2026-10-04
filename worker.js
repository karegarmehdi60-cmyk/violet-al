export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return json({
        ok: true,
        provider: "Groq",
        model: "openai/gpt-oss-120b"
      });
    }

    if (request.method === "POST" &&
        (url.pathname === "/chat" || url.pathname === "/api/chat")) {
      try {
        const body = await request.json();

        let messages = [];

        if (Array.isArray(body.messages)) {
          messages = body.messages
            .filter(
              m =>
                m &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string"
            )
            .slice(-30);
        } else if (typeof body.message === "string") {
          messages = [
            {
              role: "user",
              content: body.message
            }
          ];
        }

        if (!messages.length) {
          return json({ error: "Message is empty." }, 400);
        }

        if (!env.GROQ_API_KEY) {
          return json(
            { error: "GROQ_API_KEY is not configured." },
            500
          );
        }

        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": Bearer ${env.GROQ_API_KEY},
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-120b",
              messages: [
                {
                  role: "system",
                  content:
                    "You are Violet AI, a helpful and friendly AI assistant. " +
                    "Reply in the same language as the user. " +
                    "Answer clearly and naturally. " +
                    "If asked who created you, answer: Maziar M.K."
                },
                ...messages
              ],
              temperature: 0.7
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return json(
            {
              error: "Groq request failed.",
              details: data
            },
            502
          );
        }

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
          return json(
            { error: "Groq returned an empty response." },
            502
          );
        }

        return json({ reply }, 200);
      } catch (error) {
        return json(
          {
            error: "Cloudflare Worker error.",
            details: String(error)
          },
          500
        );
      }
    }

    if (request.method === "GET" && url.pathname === "/") {
      const assetRequest = new Request(
        new URL("/violet_grok/violet_ai_frontend.html", request.url),
        request
      );

      return env.ASSETS.fetch(assetRequest);
    }

    return new Response("Not Found", { status: 404 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
