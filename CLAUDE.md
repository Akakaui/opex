# OPEX — AI Business Operating System

## Overview

OPEX is a fleet of 15 specialized AI agents that run a creator's personal brand, content operations, client acquisition, sales pipeline, digital products, and video production.

## Quick Start

### OpenCode
```bash
# Agents are in agents/ directory
# Skills are in skills/ directory
# Tools are in tools/ directory
# Run: @opex [your request]
```

### Claude Code
```bash
# This CLAUDE.md file provides context
# Agents are referenced in agents/ directory
# Skills are referenced in skills/ directory
# Tools are referenced in tools/ directory
# Run: [your request] (Claude will read this file for context)
```

## Directory Structure

```
opex/
├── agents/           # 15 AI agent definitions
│   ├── opex.md      # Main orchestrator
│   ├── browser.md   # Browser automation
│   ├── client.md    # Client management
│   ├── content.md   # Content planning
│   ├── writer.md    # Content writing
│   ├── copy.md      # Sales copy
│   ├── design.md    # Visual design
│   ├── editorial.md # Long-form content
│   ├── knowledge.md # Knowledge ingestion
│   ├── marketing.md # Marketing strategy
│   ├── offer.md     # Product/offer creation
│   ├── research.md  # Research & analytics
│   ├── sales.md     # Sales pipeline
│   ├── scheduler.md # Scheduling & briefs
│   └── video.md     # Video production
├── skills/           # 17 skill definitions
│   ├── attention.skill.md
│   ├── bootstrap.skill.md
│   ├── browser.skill.md
│   ├── cleanup.skill.md
│   ├── confirmation.skill.md
│   ├── content-mission.skill.md
│   ├── design.skill.md
│   ├── document.skill.md
│   ├── humanizer.skill.md
│   ├── psychology.skill.md
│   ├── reels-patterns.skill.md
│   ├── sales.skill.md
│   ├── skill-creator.skill.md
│   ├── skill-scanner.skill.md
│   ├── tools.skill.md
│   ├── voice.skill.md
│   └── watch.skill.md
├── tools/            # Executable scripts
│   ├── document/     # PDF/DOCX generators
│   ├── mcp/          # MCP servers
│   └── export.py     # Playwright export
├── config/           # Configuration
├── knowledge/        # Training data
├── memory/           # Goals, sessions
└── CLAUDE.md         # This file
```

## Agent Usage

### OpenCode
```
@opex What should I post today?
@opex Write a sales email
@opex Create a carousel design
@opex Analyze my competitor
```

### Claude Code
```
What should I post today?
Write a sales email
Create a carousel design
Analyze my competitor
```

## Skills

Skills are loaded by agents based on the task. Key skills:

- **voice** — Writing quality and tone
- **humanizer** — Strip AI patterns (mandatory for all content)
- **design** — All visual design formats
- **document** — PDF and Word document creation
- **watch** — Video analysis and transcription
- **browser** — On-demand browser automation

## Tools

- **document/pdf.js** — Generate PDFs from JSON content
- **document/docx.js** — Generate Word docs from JSON content
- **document/html2pdf.js** — HTML to PDF via Playwright
- **export.py** — Playwright PNG export for designs
- **mcp/transcribe-server.js** — YouTube transcript extraction

## Brand Specs

- Background: #0A0A0A
- Card: #141414
- Accent: #FF6500 (ONE per design)
- Text: #FFFFFF primary, #A0A0A0 secondary
- Font: Montserrat

## Goals

- North star: $100K USD in 6 months
- No face-forward content
- All content passes through humanizer skill

## Date & Time

Last updated: 2026-06-26
