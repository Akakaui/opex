# WATCH SKILL

Last updated: 2026-06-26
Version: 2
Scope: Knowledge Ingestion Agent, Video Agent, Research Agent
Reference: github.com/bradautomates/claude-video (MIT)

## PURPOSE

Give agents the ability to watch and analyze any video.
Not just read a transcript. Actually see what is on screen
frame by frame and hear what is said with timestamps.
Full breakdown of visual patterns, editing style, and hooks.

## HOW IT WORKS

The /watch command:

1. Takes a URL (YouTube, TikTok, Instagram, Loom,
   X/Twitter, Vimeo, local file)
2. Downloads via yt-dlp
3. Extracts frames at auto-scaled rate
4. Pulls transcript via native captions (free)
   or Whisper API (fallback)
5. Hands both frames + transcript to the invoking agent
6. Agent sees the video AND reads the audio together

## MODES

### Transcript Mode (fast)
```bash
node ~/.config/opencode/tools/ingest/extractor.js <url> --mode transcript
```
- Extracts subtitles/transcript only
- No video download
- Best for: blog posts, articles, quick analysis

### Analysis Mode (default)
```bash
node ~/.config/opencode/tools/ingest/extractor.js <url> --mode analysis
```
- Downloads video (720p)
- Extracts key frames (1 per 30 seconds)
- Extracts transcript
- Best for: most content analysis

### Deep Analysis Mode (full)
```bash
node ~/.config/opencode/tools/ingest/extractor.js <url> --mode deep
```
- Downloads video (720p)
- Extracts frames at higher rate (1 per 10 seconds)
- Extracts transcript
- Full visual pattern analysis
- Best for: viral content, competitor analysis, learning hooks

### Ingest Mode (store knowledge)
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode analysis
```
- Full extraction + classification + storage
- Best for: training the knowledge base

## INSTALLATION

Manual:
  git clone https://github.com/bradautomates/claude-video.git
  ~/.claude/skills/watch

Dependencies:
  yt-dlp — video download (installed at /home/ubuntu/.local/bin/yt-dlp)
  ffmpeg — frame extraction (installed)
  Ollama nomic-embed-text — local embeddings (running)
  Qdrant — vector storage (running on port 6333)

## USAGE

Basic:
  /watch [URL] [question or instruction]

Focused section:
  /watch [URL] --start [time] --end [time]

Higher resolution:
  /watch [URL] --resolution 1024

Transcript only:
  /watch [URL] --mode transcript

Full analysis:
  /watch [URL] --mode deep

Ingest to knowledge base:
  /watch [URL] --ingest

## FRAME BUDGET

  ≤30 seconds: ~30 frames
  30-60 seconds: ~40 frames
  1-3 minutes: ~60 frames
  3-10 minutes: ~80 frames
  10+ minutes: 100 frames (sparse — use --start/--end for focus)

## WHEN AGENTS INVOKE THIS

Knowledge Ingestion Agent:
  /watch [expert video URL] --ingest
  "Extract all frameworks, methods, hooks, pattern
  interrupts, and business principles. Identify what
  appears on screen during key points and how
  concepts are visualized. Store in appropriate domain."

Video Agent (reel analysis):
  /watch [reel URL] --mode deep
  "Analyze the hook setup in frames 0-3, the pattern
  interrupt location and type, the pacing and cut
  frequency, the text overlay timing, the animation
  style, and the CTA placement and format."

Research Agent:
  /watch [competitor video URL] --mode analysis
  "Analyze the content structure, key arguments,
  visual presentation style, and why this video
  is likely performing well."

OPEX (orchestrator):
  /watch [URL]
  "Full breakdown: frames, audio, subtitles, visual
  patterns, editing style, hooks, and CTAs. Store
  relevant patterns in domain knowledge."
