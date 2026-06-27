# WATCH SKILL

Last updated: 2026-06-26
Version: 1
Scope: Knowledge Ingestion Agent, Video Agent, Research Agent
Reference: github.com/bradautomates/claude-video (MIT)

## PURPOSE

Give agents the ability to watch and analyze any video.
Not just read a transcript. Actually see what is on screen
frame by frame and hear what is said with timestamps.

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

## INSTALLATION

Manual:
  git clone https://github.com/bradautomates/claude-video.git
  ~/.claude/skills/watch

Dependencies:
  yt-dlp — video download
  ffmpeg — frame extraction
  Groq API key — preferred Whisper transcription (optional)
    whisper-large-v3 (faster and cheaper than OpenAI)
  OpenAI API key — fallback Whisper (optional)

First run:
  On Linux: apt install yt-dlp ffmpeg
  API key for Whisper: optional, only needed when video
    has no captions (most YouTube videos have auto-captions)

## USAGE

Basic:
  /watch [URL] [question or instruction]

Focused section:
  /watch [URL] --start [time] --end [time]

Higher resolution:
  /watch [URL] --resolution 1024

No transcription:
  /watch [URL] --no-whisper

## FRAME BUDGET

  ≤30 seconds: ~30 frames
  30-60 seconds: ~40 frames
  1-3 minutes: ~60 frames
  3-10 minutes: ~80 frames
  10+ minutes: 100 frames (sparse — use --start/--end for focus)

## WHEN AGENTS INVOKE THIS

Knowledge Ingestion Agent:
  /watch [expert video URL]
  "Extract all frameworks, methods, hooks, pattern
  interrupts, and business principles. Identify what
  appears on screen during key points and how
  concepts are visualized."

Video Agent (reel analysis):
  /watch [reel URL]
  "Analyze the hook setup in frames 0-3, the pattern
  interrupt location and type, the pacing and cut
  frequency, the text overlay timing, the animation
  style, and the CTA placement and format."

Research Agent:
  /watch [competitor video URL]
  "Analyze the content structure, key arguments,
  visual presentation style, and why this video
  is likely performing well."
