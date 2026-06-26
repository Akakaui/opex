# BROWSER

Last updated: 2025-06-25
Version: 1
Scope: OPEX (orchestrator), Research Agent, Marketing Agent

## PURPOSE

Launch agent-browser on-demand for web browsing, form filling, data extraction, and site interaction. Does NOT run in background — only starts when a task explicitly requires browser access.

## USAGE

When a task requires a real browser:
1. Check if the task genuinely needs a browser (JS rendering, login, form submit, screenshot)
2. If yes, run: `agent-browser "https://example.com" --timeout 30000`
3. Agent-browser opens Chromium, performs the task, returns result
4. Agent-browser process exits when done — no lingering daemon

## COMMANDS

- `agent-browser <url>` — open URL and interact
- `agent-browser --help` — list all options
- Only use when webbfetch or direct API calls cannot get the job done

## WHEN NOT TO USE

- API calls (use curl, webfetch, or direct API)
- Static page content (use webfetch)
- Terminal tasks (use bash directly)
