# OPEX — AI Business Operating System

A fleet of 15 specialized AI agents for content operations, client acquisition, sales pipeline, digital products, and video production.

## Supports

- **OpenCode** — Use `@opex [request]` to invoke agents
- **Claude Code** — Use `@opex [request]` or just ask naturally

## Quick Install

### Option 1: npx (Recommended)

```bash
npx @akakaui/create-opex
```

Interactive wizard sets up everything for you.

### Option 2: Manual Install

```bash
# Clone the repo
git clone https://github.com/Akakaui/opex.git

# For OpenCode
cp -r opex/agents/ ~/.config/opencode/agents/
cp -r opex/skills/ ~/.config/opencode/skills/
cp -r opex/tools/ ~/.config/opencode/tools/

# For Claude Code
mkdir -p ~/.claude/agents
cp opex/claude-agents/*.md ~/.claude/agents/
cp opex/CLAUDE.md ~/.claude/
```

## Agents

| Agent | Purpose |
|-------|---------|
| opex | Main orchestrator — routes requests |
| browser | On-demand browser automation |
| client | Client management |
| content | Content planning |
| writer | Content writing |
| copy | Sales copy |
| design | Visual design (carousels, banners, posters, thumbnails) |
| editorial | Long-form content |
| knowledge | Knowledge ingestion from videos |
| marketing | Marketing strategy |
| offer | Product/offer creation |
| research | Research & analytics |
| sales | Sales pipeline |
| scheduler | Scheduling & daily briefs |
| video | Video production |

## Skills

| Skill | Purpose |
|-------|---------|
| voice | Writing quality and tone |
| humanizer | Strip AI patterns from content |
| design | All visual design formats |
| document | PDF and Word document creation |
| watch | Video analysis and transcription |
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

## Configuration

### OpenCode

Agents are in `~/.config/opencode/agents/`. Edit any `.md` file to customize.

### Claude Code

Agents are in `~/.claude/agents/`. Edit any `.md` file to customize.

### Brand Specs (Customize These)

- Background: #0A0A0A
- Card: #141414
- Accent: #FF6500 (ONE per design)
- Text: #FFFFFF primary, #A0A0A0 secondary
- Font: Montserrat

## How It Works

1. **Orchestrator** (`opex.md`) receives your request
2. **Routes** to the right specialized agent
3. **Agent loads** relevant skills for the task
4. **Executes** with brand consistency
5. **Returns** finished output

## Customization

- Edit agent files to change behavior
- Add new skills in `skills/` directory
- Modify brand specs in agent files
- Add new agents by creating `.md` files

## License

MIT
