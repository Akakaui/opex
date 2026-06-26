# OPEX — AI Business Operating System

A fleet of 15 specialized AI agents that run a creator's personal brand, content operations, client acquisition, sales pipeline, digital products, and video production.

## Supports

- **OpenCode** — Use `@opex [request]` to invoke agents
- **Claude Code** — Agents work automatically with context

## Quick Install

```bash
# Clone the repo
git clone https://github.com/Akakaui/opex.git

# Copy to global location
cp -r agents/ ~/.config/opencode/agents/
cp -r skills/ ~/.config/opencode/skills/
cp -r tools/ ~/.config/opencode/tools/

# For Claude Code
cp CLAUDE.md ~/.config/claude/
```

## Agents

| Agent | Purpose |
|-------|---------|
| opex | Main orchestrator |
| browser | On-demand browser automation |
| client | Client management |
| content | Content planning |
| writer | Content writing |
| copy | Sales copy |
| design | Visual design |
| editorial | Long-form content |
| knowledge | Knowledge ingestion |
| marketing | Marketing strategy |
| offer | Product/offer creation |
| research | Research & analytics |
| sales | Sales pipeline |
| scheduler | Scheduling & briefs |
| video | Video production |

## Skills

| Skill | Purpose |
|-------|---------|
| voice | Writing quality and tone |
| humanizer | Strip AI patterns |
| design | All visual design formats |
| document | PDF and Word documents |
| watch | Video analysis |
| browser | Browser automation |
| attention | Hook patterns |
| psychology | Persuasion tactics |
| sales | Sales framework |
| cleanup | Session cleanup |
| + more | See skills/ directory |

## Tools

- `tools/document/` — PDF and Word document generators
- `tools/mcp/` — MCP servers (YouTube transcription)
- `tools/export.py` — Playwright PNG export

## Brand Specs

- Background: #0A0A0A
- Card: #141414
- Accent: #FF6500 (ONE per design)
- Text: #FFFFFF primary, #A0A0A0 secondary
- Font: Montserrat

## License

MIT
