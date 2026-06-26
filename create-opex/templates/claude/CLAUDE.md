# OPEX — AI Business Operating System

## Overview

OPEX is a fleet of 15 specialized AI agents for content operations, client acquisition, sales pipeline, digital products, and video production.

## Quick Start

Use `@opex [your request]` to invoke the orchestrator, or call agents directly:
- `@content-writer Write a LinkedIn post`
- `@design-agent Create a YouTube thumbnail`
- `@sales-agent Draft a cold email`

## Agents

| Agent | Purpose |
|-------|---------|
| opex | Main orchestrator — routes requests |
| browser | Browser automation |
| client-agent | Client management |
| content-planner | Content planning |
| content-writer | Content writing |
| copy-agent | Sales copy |
| design-agent | Visual design |
| editorial-agent | Long-form content |
| knowledge-ingestion | Knowledge training |
| marketing-agent | Marketing strategy |
| offer-agent | Product/offer creation |
| research-agent | Research & analytics |
| sales-agent | Sales pipeline |
| scheduler-agent | Scheduling & briefs |
| video-agent | Video production |

## Brand Specs

- Background: #0A0A0A
- Card: #141414
- Accent: #FF6500 (ONE per design)
- Text: #FFFFFF primary, #A0A0A0 secondary
- Font: Montserrat

## Tools

- `tools/document/` — PDF and Word document generators
- `tools/mcp/` — MCP servers (YouTube transcription)
- `tools/export.py` — Playwright PNG export

## Goals

- North star: grow audience and generate leads
- All content passes through humanizer patterns
- Consistent brand across all platforms
