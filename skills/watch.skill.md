# WATCH SKILL

Last updated: 2026-06-27
Version: 4
Scope: Knowledge Ingestion Agent, Video Agent, Research Agent

## PURPOSE

Universal content extraction and analysis from ANY platform.
Downloads audio for transcription + video for visual analysis.
All temp files deleted after processing. Storage never fills up.

## SUPPORTED PLATFORMS

YouTube, Instagram, TikTok, Twitter/X, Facebook, LinkedIn,
Vimeo, SoundCloud, and 1000+ other sites via yt-dlp.

## HOW IT WORKS

1. User provides URL from any platform
2. Extract metadata (title, description, tags)
3. Download audio → Transcribe (Groq Whisper)
4. Download video → Extract frames (if analysis mode)
5. Analyze content (patterns, hooks, frameworks)
6. Store in appropriate domain
7. DELETE ALL TEMP FILES

## MODES

### Transcript Mode (audio only)
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode transcript
```
- Downloads audio only
- Transcribes with Groq Whisper
- Stores transcript in domain
- Deletes audio
- Best for: pure knowledge extraction

### Analysis Mode (audio + video)
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode analysis
```
- Downloads audio + video
- Transcribes audio
- Extracts frames (1 per 30 seconds)
- Analyzes visual patterns + audio content
- Deletes everything
- Best for: competitor research, content analysis

### Deep Mode (full breakdown)
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode deep
```
- Downloads audio + video
- Transcribes audio
- Extracts frames at higher rate (1 per 10 seconds)
- Full visual + audio analysis
- Deletes everything
- Best for: viral content, hook analysis, style reverse-engineering

## USE CASES

### 1. Knowledge Extraction (audio only)
User: "Watch this Hormozi video and extract the frameworks"
Flow: Download audio → Transcribe → Extract patterns → Store → Delete audio

### 2. Content Inspiration (video analysis)
User: "Analyze this reel and help me create similar content"
Flow: Download video → Extract frames + audio → Analyze hooks/patterns → Store → Delete everything

### 3. Competitor Research (full analysis)
User: "What's working for this competitor?"
Flow: Download video → Extract frames + audio → Analyze structure/CTAs → Store → Delete everything

### 4. Batch Ingestion (multiple videos)
User: "Ingest all these URLs for training"
Flow: For each URL: Download → Transcribe → Store → Delete → Next

## CLEANUP RULES (MANDATORY)

After EVERY operation:

```bash
# Delete audio files
rm -f /tmp/opex-audio-*
rm -f /tmp/*.webm
rm -f /tmp/*.wav
rm -f /tmp/*.mp3

# Delete video files
rm -f /tmp/opex-video-*
rm -f /tmp/*.mp4
rm -f /tmp/*.mkv

# Delete frames
rm -rf /tmp/opex-frames-*
rm -f /tmp/*.jpg
rm -f /tmp/*.png

# Delete subtitles
rm -f /tmp/*.vtt
rm -f /tmp/*.srt

# Delete temp folders
rm -rf /tmp/opex-extract-*
rm -rf /tmp/opex-transcript-*
```

**NO EXCEPTIONS.** Every file gets deleted after processing.

## DEPENDENCIES

- yt-dlp — video/audio download (at /home/ubuntu/.local/bin/yt-dlp)
- ffmpeg — audio conversion + frame extraction
- Groq API key — Whisper transcription ($GROQ_API_KEY)
- Ollama — local embeddings (nomic-embed-text)
- Qdrant — vector storage (port 6333)

## USAGE

Basic:
  /watch [URL] [question or instruction]

Transcript only (no video download):
  /watch [URL] --mode transcript

Full analysis (audio + video + frames):
  /watch [URL] --mode deep

Ingest to knowledge base:
  /watch [URL] --ingest

Batch ingest:
  /watch-batch [URL1] [URL2] [URL3] --ingest

## EXAMPLES

### Extract knowledge from YouTube video
```
@opex watch https://youtube.com/watch?v=abc123
"Transcribe this video and extract all frameworks and methods.
Store in appropriate domain."
```

### Analyze Instagram reel for patterns
```
@opex watch https://instagram.com/reel/abc123
"Analyze the hook, pacing, visual style, and CTAs.
Help me understand what makes this work."
```

### Batch ingest training content
```
@opex watch https://youtube.com/watch?v=abc123 https://youtube.com/watch?v=def456
"Ingest all these videos for training. Extract transcripts and patterns."
```

## GROQ API KEY

Get free key: https://console.groq.com/keys

Set in environment:
```bash
export GROQ_API_KEY="gsk_..."
```

Or add to ~/.bashrc:
```bash
echo 'export GROQ_API_KEY="gsk_..."' >> ~/.bashrc
source ~/.bashrc
```
