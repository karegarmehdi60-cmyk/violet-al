export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test Cloudflare -> Render -> OpenRouter
    if (request.method === "GET" && url.pathname === "/api/test-render") {
      try {
        const response = await fetch(
          "https://violet-al-1.onrender.com/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: "سلام، فقط یک تست کوتاه انجام بده."
            })
          }
        );

        const responseText = await response.text();

        return new Response(
          JSON.stringify(
            {
              cloudflare: "OK",
              renderStatus: response.status,
              renderResponse: responseText
            },
            null,
            2
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify(
            {
              cloudflare: "OK",
              error: error.message || String(error)
            },
            null,
            2
          ),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );
      }
    }

    // Normal chat
    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return json({ error: "Message is empty." }, 400);
        }

        const response = await fetch(
          "https://violet-al-1.onrender.com/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: message
            })
          }
        );

        const responseText = await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            error: responseText
          };
        }

        if (!response.ok) {
          return json(
            {
              error: "Render request failed.",
              status: response.status,
              details: data.error  data.details  "Unknown Render error."
            },
            502
          );
        }

        return json(data);
      } catch (error) {
        return json(
          {
            error: "Cloudflare proxy error.",
            details: error.message || String(error)
          },
          500
        );
      }
    }

    // Violet frontend
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
        proxy: "Cloudflare -> Render"
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
      status: status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    }
  );
}
