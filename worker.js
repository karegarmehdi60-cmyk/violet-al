export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/chat") {
      const body = await request.json();
      const message = String(body?.message || "").trim();

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message is empty." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
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
                content: "You are Violet AI. Reply in the same language as the user. If asked who created you, answer: Maziar M.K."
              },
              {
                role: "user",
                content: message
              }
            ]
          })
        }
      );

      const data = await response.json();

      return new Response(
        JSON.stringify({
          reply: data?.choices?.[0]?.message?.content || "No response."
        }),
        {
          status: response.ok ? 200 : 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response("Violet AI Worker is running.");
  }
};
