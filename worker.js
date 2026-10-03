export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      return Response.json({
        ok: true,
        keyConfigured: Boolean(env.OPENROUTER_API_KEY)
      });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        if (!env.OPENROUTER_API_KEY) {
          return Response.json(
            { error: "OPENROUTER_API_KEY is not configured." },
            { status: 500 }
          );
        }

        const body = await request.json();
        const message = String(body?.message || "").trim();

        if (!message) {
          return Response.json(
            { error: "Message is empty." },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": Bearer ${env.OPENROUTER_API_KEY},
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
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
                {
                  role: "user",
                  content: message
                }
              ],
              temperature: 0.7
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error:
                data?.error?.message ||
                "OpenRouter request failed."
            },
            { status: 500 }
          );
        }

        const reply =
          data?.choices?.[0]?.message?.content;

        if (!reply) {
          return Response.json(
            { error: "The model returned an empty response." },
            { status: 500 }
          );
        }

        return Response.json({ reply });

      } catch (error) {
        return Response.json(
          { error: error?.message || "Server error." },
          { status: 500 }
        );
      }
    }

    if (url.pathname === "/") {
      const assetUrl = new URL(
        "/violet_ai_frontend.html",
        request.url
      );

      return env.ASSETS.fetch(
        new Request(assetUrl, request)
      );
    }

    return env.ASSETS.fetch(request);
  }
};
