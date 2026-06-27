# CLEANUP SKILL

Last updated: 2026-06-26
Version: 1
Scope: Runs at end of every session via OPEX
Invoked by: OPEX (automatic) or user request

## PURPOSE

Keep the VPS clean within storage limits.
Push approved content to Notion for posting.
Backup memory files to Google Drive weekly.
Log the session and free up space after every session.

## CLEANUP TRIGGER

Automatic: OPEX invokes this at end of every session
Manual: User says "clean up", "end session",
        "clear temp files", "push to notion"

## WHAT GETS DELETED

Confirmed temporary files (no confirmation needed):

  /tmp/watch-*          ← video download folders
  /tmp/frames-*         ← extracted frame folders
  /tmp/audio-*          ← Whisper audio clips
  /tmp/remotion-*       ← Remotion working files
  /home/user/slides/    ← exported PNG slides
                          (only after confirmed push to Notion)
  /home/user/*.html     ← carousel preview files
                          (only after export confirmed)
  Any file in /tmp/ older than 24 hours

Flagged for review (requires confirmation before deletion):

  Files in /video-engine/ not referenced in any config
  Duplicate asset files
  Old versions of skill files (keep last 3 versions)
  Qdrant data older than 90 days (flag only, user decides)

NEVER delete (protected):

  .opex/skills/
  .opex/agents/
  .opex/memory/
  .opex/knowledge/
  .opex/config/
  .opex/video-engine/global-assets/
  Any file flagged as permanent in its header

## PUSH TO NOTION

Daily brief: Create/update page in Notion
  Page title: Daily Brief — [DATE]
  Contents:
    Active goal status
    Today's approved content with full copy
    Platform and format for each piece
    Mission tag
    Any pending tasks

Content calendar update:
  Update calendar with approved content
  Date, platform, format, mission, copy (linked), status

Goals update:
  Sync goals.memory.md status to Notion Goals dashboard

## PUSH TO GOOGLE DRIVE (Weekly backup)

Memory backups (weekly, on Sundays):
  Folder: OPEX-System/Memory-Backups/[YYYY-MM-DD]/
  Contents: Copy of all .memory.md files

## CLEANUP REPORT FORMAT

After cleanup runs:

CLEANUP COMPLETE — [DATE]

Temp files removed:
  [filename or folder] — [size]
  [total]: [X MB freed]

Content pushed to Notion:
  [page names updated]

VPS storage status:
  Used: [X GB] / [total] GB
  Free: [Y GB]
  Status: [healthy / watch / critical]

Session logged to sessions.memory.md.

## STORAGE ALERTS

>70% used: "VPS is 70% full. Consider pushing older
            assets to Drive."
>80% used: "VPS is 80% full. Initiating asset cleanup
            and Drive migration."
>90% used: "VPS is 90% full. URGENT — manual review
            required."
