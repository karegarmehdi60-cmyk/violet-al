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

      return env.ASSETS.fetch(assetRequest);
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders()
    });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type",
    "Cache-Control": "no-store"
  };
}

function json(data, status) {
  return new Response(
    JSON.stringify(data),
    {
      status: status || 200,
      headers: {
        ...corsHeaders(),
        "Content-Type":
          "application/json; charset=UTF-8"
      }
    }
  );
}
