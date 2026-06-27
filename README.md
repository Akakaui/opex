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
| watch | Video analysis and transcription (multi-platform) |
| browser | Browser automation |
| attention | Hook patterns |
| psychology | Persuasion tactics |
| sales | Sales framework |
| cleanup | Session cleanup (auto-deletes temp files) |
| domain-router | Domain-based knowledge routing |
| + more | See skills/ directory |

## Knowledge Ingestion

### What It Does

Extract knowledge from ANY video platform and build your own training data:

- **YouTube** — Full transcripts + visual analysis
- **Instagram** — Reels, posts, stories
- **TikTok** — Videos, audio
- **Twitter/X** — Tweets, threads, spaces
- **Facebook** — Videos, reels
- **LinkedIn** — Videos, posts
- **+1000 sites** — Via yt-dlp

### How It Works

1. Give OPEX a URL from any platform
2. System downloads audio → transcribes (Groq Whisper)
3. Optionally extracts frames for visual analysis
4. Classifies content to a domain (e.g., `yt-viral-hooks`, `ig-carousel-design`)
5. Stores patterns, frameworks, examples in Qdrant
6. **Deletes all temp files** (audio, video, frames)

### Use Cases

**Pure Knowledge Extraction:**
```
@opex watch https://youtube.com/watch?v=abc123
"Extract all frameworks and methods from this video"
```

**Content Inspiration:**
```
@opex watch https://instagram.com/reel/abc123
"Analyze the hook, pacing, and visual style. Help me create similar content"
```

**Competitor Research:**
```
@opex watch https://youtube.com/watch?v=abc123
"What's working for this competitor? Analyze their structure and CTAs"
```

**Batch Training:**
```
@opex watch https://youtube.com/watch?v=abc123 https://youtube.com/watch?v=def456
"Ingest all these videos for training"
```

## Tools

| Tool | Purpose |
|------|---------|
| `tools/ingest/extractor.js` | Universal content extraction (any platform) |
| `tools/ingest/pipeline.js` | Full ingestion pipeline (extract → classify → store → cleanup) |
| `tools/ingest/classifier.js` | Domain classification (LLM + pattern matching) |
| `tools/ingest/embedder.js` | Vector embeddings (Ollama nomic-embed-text) |
| `tools/ingest/qdrant.js` | Vector DB operations |
| `tools/document/` | PDF and Word document generators |
| `tools/export.py` | Playwright PNG export |

## Cleanup System

Every ingestion automatically cleans up:

- Downloaded audio (.webm, .wav, .mp3)
- Downloaded video (.mp4, .mkv)
- Extracted frames (.jpg, .png)
- Subtitle files (.vtt, .srt)
- Temp folders (/tmp/opex-*)

**Storage never fills up.** All temp files deleted after processing.

## Configuration

### OpenCode

Agents are in `~/.config/opencode/agents/`. Edit any `.md` file to customize.

### Claude Code

Agents are in `~/.claude/agents/`. Edit any `.md` file to customize.

### Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| OpenRouter | LLM access | https://openrouter.ai/keys |
| Groq | Audio transcription | https://console.groq.com/keys |

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
