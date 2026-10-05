export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return new Response(JSON.stringify({
        ok: true,
        provider: "Groq",
        model: "openai/gpt-oss-120b",
        keyConfigured: Boolean(env.GROQ_API_KEY)
      }), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/chat" || url.pathname === "/api/chat")
    ) {
      if (!env.GROQ_API_KEY) {
        return new Response(JSON.stringify({
          error: "GROQ_API_KEY is not configured."
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }

      try {
        const body = await request.json();
        let messages = [];

        if (Array.isArray(body.messages)) {
          messages = body.messages
            .filter(function (m) {
              return (
                m &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string"
              );
            })
            .slice(-30);
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
          return new Response(JSON.stringify({
            error: "Message is empty."
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          });
        }

        const groqResponse = await fetch(
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
                    "You are Violet AI. Reply in the same language as the user. If asked who created you, answer: Maziar M.K."
                }
              ].concat(messages),
              temperature: 0.7
            })
          }
        );

        const responseText = await groqResponse.text();

        if (!groqResponse.ok) {
          return new Response(JSON.stringify({
            error: "Groq request failed.",
            source: "groq",
            status: groqResponse.status,
            details: responseText
          }), {
            status: groqResponse.status,
            headers: {
              "Content-Type": "application/json"
            }
          });
        }

        const data = JSON.parse(responseText);

        const reply =
          data &&
          data.choices &&
          data.choices[0] &&
          data.choices[0].message
            ? data.choices[0].message.content
            : null;

        if (!reply) {
          return new Response(JSON.stringify({
            error: "Groq returned an empty response.",
            source: "groq"
          }), {
            status: 502,
            headers: {
              "Content-Type": "application/json"
            }
          });
        }

        return new Response(JSON.stringify({
          reply: reply
        }), {
          headers: {
            "Content-Type": "application/json"
          }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          error: "Worker error.",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
    }

    if (request.method === "GET" && url.pathname === "/") {
      const assetUrl = new URL(
        "/violet_grok/violet_ai_frontend.html",
        request.url
      );

      return env.ASSETS.fetch(
        new Request(assetUrl, request)
      );
    }

    return new Response("Not Found", {
      status: 404
    });
  }
};
