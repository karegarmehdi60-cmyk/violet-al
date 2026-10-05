export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return json({
        ok: true,
        provider: "Groq",
        model: "openai/gpt-oss-120b",
        keyConfigured: Boolean(env.GROQ_API_KEY)
      });
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/chat" || url.pathname === "/api/chat")
    ) {
      try {
        if (!env.GROQ_API_KEY) {
          return json(
            { error: "GROQ_API_KEY is not configured." },
            500
          );
        }

        const body = await request.json();
        let messages = [];

        if (Array.isArray(body.messages)) {
          messages = body.messages
            .filter(function (m) {
              return (
                m &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string" &&
                m.content.trim().length > 0
              );
            })
            .slice(-20);
        } else if (
          typeof body.message === "string" &&
          body.message.trim()
        ) {
          messages = [
            {
              role: "user",
              content: body.message.trim()
            }
          ];
        }

        if (!messages.length) {
          return json(
            { error: "Message is empty." },
            400
          );
        }

        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + env.GROQ_API_KEY,
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
                }
              ].concat(messages),
              temperature: 0.7
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return json(
            {
              error:
                data &&
                data.error &&
                data.error.message
                  ? data.error.message
                  : "Groq request failed.",
              status: response.status
            },
            response.status
          );
        }

        const reply =
          data &&
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content;

        if (!reply) {
          return json(
            { error: "Groq returned an empty response." },
            502
          );
        }

        return json({ reply: reply });
      } catch (error) {
        return json(
          {
            error: "Cloudflare Worker error.",
            details: String(
              error && error.message
                ? error.message
                : error
            )
          },
          500
        );
      }
    }

    if (request.method === "GET" && url.pathname === "/") {
      const assetRequest = new Request(
        new URL(
          "/violet_grok/violet_ai_frontend.html",
          request.url
        ),
        request
      );

      return env.ASSETS.fetch(assetRequest);
    }

    return new Response("Not Found", {
      status: 404
    });
  }
};

function json(data, status) {
  return new Response(
    JSON.stringify(data),
    {
      status: status || 200,
      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}
