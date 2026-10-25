export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Status check
    if (request.method === "GET" && url.pathname === "/api/status") {
      return json({
        ok: true,
        provider: "OpenRouter",
        model: "openrouter/free",
        keyConfigured: Boolean(env.OPENROUTER_API_KEY)
      });
    }

    // Chat endpoint
    if (
      request.method === "POST" &&
      (url.pathname === "/chat" || url.pathname === "/api/chat")
    ) {
      try {
        if (!env.OPENROUTER_API_KEY) {
          return json(
            { error: "OPENROUTER_API_KEY is not configured." },
            500
          );
        }

        const body = await request.json();
        let messages = [];

        if (Array.isArray(body.messages)) {
          messages = body.messages
            .filter(
              (m) =>
                m &&
                ["user", "assistant"].includes(m.role) &&
                typeof m.content === "string" &&
                m.content.trim().length > 0
            )
            .slice(-20);
        } else if (
          typeof body.message === "string" &&
          body.message.trim().length > 0
        ) {
          messages = [
            {
              role: "user",
              content: body.message.trim()
            }
          ];
        }

        if (messages.length === 0) {
          return json({ error: "Message is empty." }, 400);
        }

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": Bearer ${env.OPENROUTER_API_KEY},
              "Content-Type": "application/json",
              "HTTP-Referer": url.origin,
              "X-Title": "Violet AI"
            },
            body: JSON.stringify({
              model: "openrouter/free",
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
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return json(
            {
              error:
                data?.error?.message ||
                "OpenRouter request failed.",
              status: response.status
            },
            response.status
          );
        }

        const reply = data?.choices?.[0]?.message?.content;

        if (typeof reply !== "string" || !reply.trim()) {
          return json(
            { error: "OpenRouter returned an empty response." },
            502
          );
        }

        return json({ reply });
      } catch (error) {
        return json(
          {
            error: "Worker error.",
            details: String(error?.message || error)
          },
          500
        );
      }
    }

    // Serve Violet frontend
    if (request.method === "GET" && url.pathname === "/") {
      return env.ASSETS.fetch(
        new Request(
          new URL(
            "/violet_grok/violet_ai_frontend.html",
            request.url
          ),
          request
        )
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
