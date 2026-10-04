export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Chat endpoint
    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await request.json();
        const message = String(body?.message || "").trim();

        if (!message) {
          return json(
            { error: "Message is empty." },
            400
          );
        }

        if (!env.OPENROUTER_API_KEY) {
          return json(
            { error: "OPENROUTER_API_KEY is not configured." },
            500
          );
        }

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + env.OPENROUTER_API_KEY,
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
          return json(
            {
              error: "OpenRouter request failed.",
              status: response.status,
              details:
                data?.error?.message ||
                data?.error?.code ||
                "Unknown OpenRouter error."
            },
            502
          );
        }

        const reply =
          data?.choices?.[0]?.message?.content;

        if (!reply) {
          return json(
            {
              error: "OpenRouter returned an empty response."
            },
            502
          );
        }

        return json({ reply });

      } catch (error) {
        return json(
          {
            error: "Worker error.",
            details: error?.message || String(error)
          },
          500
        );
      }
    }

    // Serve Violet AI frontend
    if (
      request.method === "GET" &&
      url.pathname === "/"
    ) {
      const assetRequest = new Request(
        new URL(
          "/violet_grok/violet_ai_frontend.html",
          request.url
        ),
        request
      );

      return env.ASSETS.fetch(assetRequest);
    }

    // Status endpoint
    if (
      request.method === "GET" &&
      url.pathname === "/api/status"
    ) {
      return json({
        ok: true,
        secretConfigured: Boolean(
          env.OPENROUTER_API_KEY
        )
      });
    }

    return new Response("Not Found", {
      status: 404
    });
  }
};

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=UTF-8"
      }
    }
  );
}
