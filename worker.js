details: data
            },
            groqResponse.status,
            corsHeaders
          );
        }

        // =========================
        // AI RESPONSE
        // =========================
        const reply =
          data?.choices?.[0]?.message?.content;

        if (!reply) {
          return json(
            {
              error:
                "Groq returned an empty response.",

              source: "groq",

              details: data
            },
            502,
            corsHeaders
          );
        }

        return json(
          {
            reply: reply
          },
          200,
          corsHeaders
        );
      } catch (error) {
        return json(
          {
            error:
              "Cloudflare Worker error.",

            source: "worker",

            details: String(error)
          },
          500,
          corsHeaders
        );
      }
    }

    // =========================
    // VIOLET FRONTEND
    // =========================
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

      const assetResponse =
        await env.ASSETS.fetch(assetRequest);

      const headers =
        new Headers(assetResponse.headers);

      headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );

      return new Response(
        assetResponse.body,
        {
          status: assetResponse.status,
          headers: headers
        }
      );
    }

    // =========================
    // NOT FOUND
    // =========================
    return new Response(
      "Not Found",
      {
        status: 404,
        headers: corsHeaders
      }
    );
  }
};


// =========================
// JSON HELPER
// =========================
function json(
  data,
  status = 200,
  extraHeaders = {}
) {
  const headers = new Headers({
    "Content-Type":
      "application/json; charset=UTF-8",

    "Cache-Control": "no-store"
  });

  for (
    const [key, value]
    of Object.entries(extraHeaders)
  ) {
    headers.set(key, value);
  }

  return new Response(
    JSON.stringify(data),
    {
      status: status,
      headers: headers
    }
  );
}
