export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await request.json();
        const message = String(body?.message || "").trim();

        if (!message) {
          return json({ error: "Message is empty." }, 400);
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
              "Authorization": "Bearer " + env.OPENROUTER_API_KEY
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
              error:
                data?.error?.message ||
                "OpenRouter request failed."
            },
            response.status
          );
        }

        const reply = data?.choices?.[0]?.message?.content;

        if (!reply) {
          return json(
            { error: "The model returned an empty response." },
            500
          );
        }

        return json({ reply });
      } catch (error) {
        return json(
          { error: error?.message || "Server error." },
          500
        );
      }
    }

    return new Response("Violet AI Worker is running.", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8"
      }
    });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}
