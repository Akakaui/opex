# DESIGN SKILL

Last updated: 2026-06-26
Version: 2
Scope: Design Agent, Content Writer

## PURPOSE

Complete production system for all visual design outputs.
From brief to exported PNGs, ready to post or print.
Covers social media, marketing, print, and web design.

## BRAND SPECS

Colors:
  Background: #0A0A0A (near black)
  Card: #141414 (containers, code blocks)
  Text primary: #FFFFFF
  Text secondary: #A0A0A0
  Accent: #FF6500 (ONE element max per design)

Typography:
  Font: Montserrat (all weights)
  Headline: Bold, 48-64px, #FFFFFF
  Body: Regular, 24-32px, #FFFFFF
  Secondary: Regular, 18-24px, #A0A0A0
  Accent: Bold, 24-32px, #FF6500

## FORMAT SPECS

### Social Media

Instagram Post (Square):
  Resolution: 1080x1080px
  Ratio: 1:1
  Use: Single image posts, quotes, stats

Instagram Post (Portrait):
  Resolution: 1080x1350px
  Ratio: 4:5
  Use: Carousels, single posts, infographics

Instagram Story / Reel Cover:
  Resolution: 1080x1920px
  Ratio: 9:16
  Use: Stories, reel covers, TikTok

LinkedIn Post:
  Resolution: 1200x627px
  Ratio: 1.91:1
  Use: Article shares, text posts

LinkedIn Banner:
  Resolution: 1584x396px
  Ratio: ~4:1
  Use: Profile banner

Twitter/X Post:
  Resolution: 1200x675px
  Ratio: 16:9
  Use: Tweet images, thread headers

Twitter/X Header:
  Resolution: 1500x500px
  Ratio: 3:1
  Use: Profile banner

Facebook Post:
  Resolution: 1200x630px
  Ratio: 1.91:1
  Use: Feed posts, link shares

Facebook Cover:
  Resolution: 820x312px
  Ratio: ~2.6:1
  Use: Page cover

### Video / YouTube

YouTube Thumbnail:
  Resolution: 1280x720px
  Ratio: 16:9
  Use: Video thumbnails
  Key: Bold text, high contrast, face or reaction

YouTube Banner:
  Resolution: 2560x1440px
  Ratio: 16:9
  Use: Channel art
  Safe area: 1546x423px (center)

YouTube End Screen:
  Resolution: 1280x720px
  Ratio: 16:9
  Use: Subscribe + next video prompts

TikTok Cover:
  Resolution: 1080x1920px
  Ratio: 9:16
  Use: Video cover image

### Blog / Web

Blog Hero:
  Resolution: 1200x630px
  Ratio: 1.91:1
  Use: Article headers, blog posts

OG Image:
  Resolution: 1200x630px
  Ratio: 1.91:1
  Use: Social share preview

Favicon:
  Resolution: 512x512px
  Ratio: 1:1
  Use: App icon, favicon

Logo:
  Resolution: 512x512px (or transparent PNG)
  Ratio: 1:1
  Use: Brand mark, profile picture

### Print / Marketing

Poster (A4):
  Resolution: 2480x3508px (300 DPI)
  Ratio: 1:1.41
  Use: Flyers, handouts, event posters

Poster (A3):
  Resolution: 3508x4961px (300 DPI)
  Ratio: 1:1.41
  Use: Large format prints

Business Card:
  Resolution: 1050x600px (300 DPI)
  Ratio: 3.5:2
  Use: Front and back

Banner (Web):
  Resolution: 728x90px (Leaderboard)
  Resolution: 300x250px (Medium Rectangle)
  Resolution: 160x600px (Skyscraper)
  Use: Web ads, display ads

Email Header:
  Resolution: 600x200px
  Ratio: 3:1
  Use: Newsletter headers, email templates

## SLIDE STRUCTURE (Carousels / Multi-page)

### Slide 1 — The Hook

This is the most important slide. It must stop the scroll.

Options:
  Bold claim: "I made $2,400 in 11 days with one carousel."
  Question: "Why isn't your SaaS making money?"
  Stat: "87% of newsletters fail at monetization."
  Contrarian: "Posting daily is killing your reach."

Design:
  - Large text, centered
  - Dark background
  - Minimal elements
  - No title — go straight to the hook

### Slides 2-N — The Content

One point per slide. No exceptions.

Each slide:
  - One clear headline
  - 1-3 supporting lines max
  - Visual element (icon, stat, or simple graphic)
  - Enough whitespace to breathe

### Final Slide — The CTA

Tell the reader exactly what to do:
  "Save this for later"
  "Follow for more"
  "DM me [keyword]"
  "Link in bio"

## PRODUCTION FLOW

1. Content Writer provides slide-by-slide / design brief copy
2. Design Agent writes HTML/CSS for each format
3. Export via Playwright at target resolution
4. Quality check: readability, brand alignment
5. Deliver PNGs in order

## EXPORT SETTINGS

Playwright Python script:
  Location: ~/.config/opencode/tools/export.py
  Viewport: scaled to target (e.g., 420x525 for 1080x1350)
  Device scale factor: target / viewport (e.g., 2.5714x)
  Wait: 3000ms (fonts loading)
  Format: PNG

## COMMON MISTAKES TO AVOID

- Too much text per design (max 30 words for social)
- Inconsistent spacing between elements
- Accent color used more than once per design
- White background (always #0A0A0A for brand)
- Small text that's unreadable on mobile
- No CTA on the final slide (carousels)
- Wrong dimensions for target platform
