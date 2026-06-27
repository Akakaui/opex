# DOMAIN ROUTER SKILL

Last updated: 2026-06-26
Version: 1
Scope: Orchestrator, All Agents

## PURPOSE

Routes content to appropriate knowledge domains and retrieves domain-specific knowledge when creating content. The system automatically knows what you're trying to do and applies relevant knowledge without being asked.

## HOW IT WORKS

### When You Give Content (Training)

1. Content is extracted from URL (YouTube, IG, Twitter, blog, etc.)
2. System classifies content to a domain (platform + topic)
3. Domain is created if it doesn't exist
4. Patterns, frameworks, and examples are stored
5. Knowledge is embedded in Qdrant for retrieval

### When You Create Content (Application)

1. System understands the request context
2. Automatically loads relevant domain knowledge
3. Applies proven patterns and frameworks
4. Generates content grounded in your trained knowledge

## CLASSIFICATION RULES

### Platform Detection

- YouTube URLs → yt
- Instagram URLs → ig
- Twitter/X URLs → twitter
- TikTok URLs → tiktok
- LinkedIn URLs → linkedin
- Blog/article URLs → blog
- Podcast URLs → podcast
- Other URLs → web

### Topic Detection

Analyze content for:
- viral-hooks (viral, hook, attention, scroll-stop)
- content-strategy (calendar, plan, schedule, batch)
- sales-closing (sale, close, deal, pitch, offer)
- design (layout, color, font, visual, brand)
- growth (follower, audience, reach, scale)
- monetization (money, revenue, income, profit)
- copywriting (headline, CTA, persuade, write)
- psychology (mindset, behavior, influence)
- analytics (data, metric, track, measure)
- automation (automate, system, workflow)

### Domain Naming

Format: `{platform}-{topic}`
Examples: `ig-viral-hooks`, `yt-thumbnail-design`, `sales-closing`

## TOOLS

- `tools/ingest/pipeline.js` — Full ingestion pipeline
- `tools/ingest/extractor.js` — Content extraction
- `tools/ingest/classifier.js` — Domain classification
- `tools/ingest/embedder.js` — Vector embeddings
- `tools/ingest/qdrant.js` — Vector DB operations

## COMMANDS

### Ingest Content

```bash
# Auto-classify and store
node tools/ingest/pipeline.js <url>

# Transcript only
node tools/ingest/pipeline.js <url> --mode transcript

# Full analysis
node tools/ingest/pipeline.js <url> --mode analysis

# Deep analysis
node tools/ingest/pipeline.js <url> --mode deep
```

### List Domains

```bash
cat ~/.config/opencode/skills/domain-router/domains.json
```

### Search Domain Knowledge

```bash
node tools/ingest/qdrant.js search <domain> <vector> <limit>
```

## DOMAIN STRUCTURE

Each domain has:
```
skills/{domain}/
├── SKILL.md          # Domain description and patterns
└── knowledge.json    # Examples, frameworks, sources
```

## AUTOMATIC APPLICATION

When creating content, the orchestrator:
1. Identifies the content type and platform
2. Retrieves relevant domain knowledge
3. Applies patterns and frameworks automatically
4. No need to ask "apply viral patterns" — it knows

## EXAMPLES

**Training:**
```
@opex https://youtube.com/watch?v=abc123
# → Classifies to yt-viral-hooks
# → Stores transcript and patterns
```

**Creating (automatic application):**
```
@opex write me a LinkedIn post
# → Automatically loads: voice rules + attention hooks + humanizer
# → Applies LinkedIn-specific patterns from domain knowledge
```

**Watching:**
```
@opex watch https://youtube.com/watch?v=abc123
# → Downloads video, extracts frames + audio + subtitles
# → Analyzes visual patterns, editing style, hooks
# → Stores in appropriate domain
```
