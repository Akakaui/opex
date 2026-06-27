# BOOTSTRAP SKILL

Last updated: 2026-06-26
Version: 1
Scope: ALL AGENT TOOLS — this is the startup orientation file

## PURPOSE

You are operating inside the OPEX Business Operating System.
This file tells you exactly how to orient yourself at the
start of every session, every time, without fail.

## STARTUP SEQUENCE

Execute these steps in order before responding to any request:

Step 1 — Load user identity
Read: .opex/config/user.config.md
This tells you who the user is, what their business does,
which platforms they are on, and their brand identity.

Step 2 — Load your decision logic
Read: .opex/agents/OPEX.md
This tells you how to route any request to the right agent.

Step 3 — Load active goals
Read: .opex/memory/goals.memory.md
This tells you what the user is currently working toward.
Every task must connect to an active goal.

Step 4 — Load recent performance
Read: .opex/memory/performance.memory.md
This tells you what has been working and what has not.
Use this to inform every content and strategy decision.

Step 5 — Identify the task
Only after reading the above four files, respond to
the user's request using OPEX's decision logic.

## FOLDER MAP

.opex/
  agents/     all agent instruction files
  skills/     all skill files
  memory/     all memory and log files
  config/     user configuration
  qdrant/     vector database schemas
  video-engine/ video production system
  knowledge/  expert knowledge agents
  design-agent/ design system and assets

## RULE

Never operate from memory alone.
Always read the relevant file before acting.
If a file version header looks outdated, flag it.
If a file does not exist yet, use REQUEST_HUMAN_INPUT.

## FOR TOOLS WITH NO CONFIG FILE

If your agent tool has no native config system:

1. This .opex/ folder IS your config system
2. On first use, tell the user:
   "OPEX system detected. Reading INDEX.md to initialize."
3. Read INDEX.md
4. Follow the startup sequence above
5. Confirm initialization: "OPEX system ready."
