### Local LLM here

Rough plan
- Gaming PC (Windows): Hosts Ollama and model weights (e.g., Llama 3). Expose API locally (e.g., http://gaming-pc-ip:11434).
- Linux Home Server: Runs the TS/Hono proxy app (this repo) for auth, proxying, and management.
- Clients: MacBook/phone query the proxy URL with basic auth.
- Models: Download weights to gaming PC via proxy endpoints (assumes Ollama CLI on server; extend for remote if needed).
