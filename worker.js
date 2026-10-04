export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
              message: "Hello, this is a test."
            })
          }
        );

        const responseText = await response.text();

        return new Response(
          JSON.stringify({
            cloudflare: "OK",
            renderStatus: response.status,
            renderResponse: responseText
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
            cloudflare: "OK",
            error: String(error)
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
        } catch (error) {
          data = {
            error: responseText
          };
        }

        if (!response.ok) {
          let details = "Unknown Render error.";

          if (data.error) {
            details = data.error;
          }

          if (data.details) {
            details = data.details;
          }

          return json(
            {
              error: "Render request failed.",
              status: response.status,
              details: details
            },
            502
          );
        }

        return json(data, 200);
      } catch (error) {
        return json(
          {
            error: "Cloudflare proxy error.",
            details: String(error)
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

function json(data, status) {
  return new Response(
    JSON.stringify(data),
    {
      status: status,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
