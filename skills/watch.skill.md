# WATCH SKILL

Last updated: 2026-06-27
Version: 3
Scope: Knowledge Ingestion Agent, Video Agent, Research Agent
Reference: github.com/bradautomates/claude-video (MIT)

## PURPOSE

Give agents the ability to watch and analyze any video.
Downloads audio, transcribes with Groq Whisper, extracts
frames for visual analysis. All temp files deleted after processing.

## HOW IT WORKS

The /watch command:

1. Takes a URL (YouTube, TikTok, Instagram, etc.)
2. Downloads audio via yt-dlp (audio-only, fast)
3. Transcribes audio via Groq Whisper API
4. Optionally extracts frames for visual analysis
5. Stores transcript/patterns in domain knowledge
6. DELETES all temp files (audio, frames, video)

## AUDIO TRANSCRIPTION FLOW

### Step 1: Download Audio
```bash
/home/ubuntu/.local/bin/yt-dlp -f "bestaudio" \
  -o "/tmp/opex-audio-%(id)s.%(ext)s" \
  "<video_url>"
```

### Step 2: Convert to WAV (for Whisper)
```bash
ffmpeg -i /tmp/opex-audio-*.webm \
  -ar 16000 -ac 1 \
  /tmp/opex-audio-*.wav
```

### Step 3: Transcribe with Groq Whisper
```bash
curl -X POST "https://api.groq.com/openai/v1/audio/transcriptions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F "file=@/tmp/opex-audio-*.wav" \
  -F "model=whisper-large-v3" \
  -F "response_format=json"
```

### Step 4: Delete Temp Files
```bash
rm -f /tmp/opex-audio-*.webm /tmp/opex-audio-*.wav
```

## MODES

### Transcript Mode (default)
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode transcript
```
- Downloads audio
- Transcribes with Groq Whisper
- Deletes audio
- Stores transcript in domain
- Best for: knowledge ingestion

### Analysis Mode
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode analysis
```
- Downloads audio + video
- Transcribes audio
- Extracts key frames (1 per 30 seconds)
- Deletes all temp files
- Stores analysis in domain
- Best for: content analysis, competitor research

### Deep Mode
```bash
node ~/.config/opencode/tools/ingest/pipeline.js <url> --mode deep
```
- Downloads audio + video
- Transcribes audio
- Extracts frames at higher rate (1 per 10 seconds)
- Full visual pattern analysis
- Deletes all temp files
- Best for: viral content, hook analysis

## CLEANUP RULES (MANDATORY)

After EVERY operation:

1. Delete downloaded audio (.webm, .wav, .mp3)
2. Delete downloaded video (.mp4, .mkv)
3. Delete extracted frames (.jpg, .png)
4. Delete subtitle files (.vtt, .srt)
5. Log what was deleted
6. Report: "Cleaned up [X] files, freed [Y] MB"

NO EXCEPTIONS. Storage is limited.

## DEPENDENCIES

- yt-dlp — audio/video download (at /home/ubuntu/.local/bin/yt-dlp)
- ffmpeg — audio conversion (installed)
- Groq API key — Whisper transcription (needs $GROQ_API_KEY)
- Ollama nomic-embed-text — local embeddings (running)
- Qdrant — vector storage (running on port 6333)

## USAGE

Basic:
  /watch [URL] [question or instruction]

Transcript only:
  /watch [URL] --mode transcript

Full analysis:
  /watch [URL] --mode deep

Ingest to knowledge base:
  /watch [URL] --ingest

## WHEN AGENTS INVOKE THIS

Knowledge Ingestion Agent:
  /watch [expert video URL] --ingest
  "Transcribe this video, extract frameworks and methods,
  store in appropriate domain. Delete all temp files after."

Video Agent (reel analysis):
  /watch [reel URL] --mode deep
  "Analyze the hook, pacing, visual style, and CTAs.
  Delete all frames after analysis."

Research Agent:
  /watch [competitor video URL] --mode analysis
  "Analyze content structure and key arguments.
  Delete all temp files after."

## GROQ API KEY SETUP

Get free API key from: https://console.groq.com/keys

Set in environment:
```bash
export GROQ_API_KEY="gsk_..."
```

Or add to ~/.bashrc:
```bash
echo 'export GROQ_API_KEY="gsk_..."' >> ~/.bashrc
```
