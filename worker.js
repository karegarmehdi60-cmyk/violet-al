// =========================
    // FRONTEND
    // =========================
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


// =========================
// JSON HELPER
// =========================
function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}
