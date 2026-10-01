VIOLET AI + OPENROUTER
======================

This package connects the existing Violet AI HTML interface to OpenRouter.
The API key is kept on the local Node.js server and is NOT placed in the HTML.

1) Install Node.js (LTS) on Windows if it is not already installed.

2) Open CMD inside this folder and run:
   npm install

3) Make a copy of .env.example named exactly:
   .env

4) Open .env and replace:
   PASTE_YOUR_OPENROUTER_KEY_HERE
   with your own OpenRouter API key.

   IMPORTANT: Never share .env or your API key.

5) Start Violet:
   npm start

6) Open in your browser:
   http://localhost:3000

The chat uses the OpenRouter free router (openrouter/free). Your OpenRouter
account's current free limits and model availability apply.

If you see an API error, check:
- .env is in the same folder as server.js
- the variable name is exactly OPENROUTER_API_KEY
- the API key is valid
- the Node.js server is still running

For phone access on the same Wi-Fi, use the laptop's local IP, for example:
http://192.168.1.8:3000
Replace 192.168.1.8 with your laptop's actual IPv4 address.
