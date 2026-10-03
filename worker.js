export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Chat endpoint
    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await request.json();
        const message = String(body?.message || "").trim();

        if (!message) {
          return new Response(
            JSON.stringify({
              error: "Message is empty."
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        // Check API key
        if (!env.OPENROUTER_API_KEY) {
          return new Response(
            JSON.stringify({
              error: "OPENROUTER_API_KEY is not configured."
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        // Send request to OpenRouter
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

        // OpenRouter error
        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error:
                data?.error?.message ||
                "OpenRouter request failed."
            }),
            {
              status: response.status,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        // Get AI answer
        const reply =
          data?.choices?.[0]?.message?.content;

        if (!reply) {
          return new Response(
            JSON.stringify({
              error: "The model returned an empty response."
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        return new Response(
          JSON.stringify({
            reply: reply
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error?.message || "Server error."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    // Test page
    return new Response(
      "Violet AI Worker is running.",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );
  }
};
