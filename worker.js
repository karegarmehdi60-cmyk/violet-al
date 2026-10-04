13:41:07.058
Initializing build environment...
13:41:34.166
Success: Finished initializing build environment
13:41:34.667
Cloning repository...
13:41:35.518
No build output detected to cache. Skipping.
13:41:35.518
No dependencies detected to cache. Skipping.
13:41:35.519
Detected the following tools from environment: 
13:41:35.729
Executing user deploy command: printf '%s' "$OPENROUTER_API_KEY" | npx wrangler secret put OPENROUTER_API_KEY && npx wrangler deploy
13:41:37.203
npm warn exec The following package was not found and will be installed: wrangler@4.147.0
13:41:44.690
13:41:44.690
 ⛅️ wrangler 4.147.0
13:41:44.690
────────────────────
13:41:44.717
🌀 Creating the secret for the Worker "violet-al"
13:41:45.175
✨ Success! Uploaded secret OPENROUTER_API_KEY
13:41:46.913
13:41:46.915
 ⛅️ wrangler 4.147.0
13:41:46.916
────────────────────
13:41:46.940
13:41:46.940
Cloudflare collects anonymous telemetry about your usage of Wrangler. Learn more at https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md
13:41:47.030
13:41:47.096
✘ [ERROR] Build failed with 1 error:
13:41:47.097
13:41:47.097
  ✘ [ERROR] Expected "}" but found "$"
13:41:47.097
  
13:41:47.097
      worker.js:33:38:
13:41:47.097
        33 │               "Authorization": Bearer ${env.OPENROUTER_API_KEY},
13:41:47.097
           │                                       ^
13:41:47.097
           ╵                                       }
13:41:47.098
  
13:41:47.098
  
13:41:47.098
13:41:47.098
13:41:47.128
🪵  Logs were written to "/opt/buildhome/.config/.wrangler/logs/wrangler-2026-10-04_10-11-46_632.log"
13:41:47.210
Failed: error occurred while running deploy command
Support
System status
Careers
Terms of Use
Report Security Issues
Privacy Policy
