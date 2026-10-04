export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Send chat requests through Cloudflare to Render
    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await request.json();
        const message = String(body?.message || "").trim();

        if (!message) {
          return json({ error: "Message is empty." }, 400);
        }

        const renderResponse = await fetch(
          "https://violet-al-1.onrender.com/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
          }
        );

        const data = await renderResponse.json();

        if (!renderResponse.ok) {
          return json(
            {
              error: "Render request failed.",
              status: renderResponse.status,
              details: data?.error || "Unknown Render error."
            },
            502
          );
        }

        return json(data);

      } catch (error) {
        return json(
          {
            error: "Cloudflare proxy error.",
            details: error?.message || String(error)
          },
          500
        );
      }
    }

    // Serve Violet AI frontend
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

    // Status
    if (request.method === "GET" && url.pathname === "/api/status") {
      return json({
        ok: true,
        proxy: "Cloudflare → Render"
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
        "Content-Type": "application/json; charset=UTF-8"
      }
    }
  );
}
