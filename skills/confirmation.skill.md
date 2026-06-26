# CONFIRMATION SKILL

Last updated: 2026-06-26
Version: 1
Scope: ALL AGENTS — this skill is mandatory and non-negotiable

## THE RULE

No agent takes any irreversible action without explicit user confirmation.
No exceptions. No matter how confident the agent is.

## WHAT REQUIRES CONFIRMATION

- Writing to any file (skill update, memory update, log entry)
- Calling any external API (image generation, Drive, Notion)
- Sending or scheduling any content
- Deleting any file or data
- Creating a new skill or workflow file
- Making any purchase or API call that costs money
- Running any bash command that modifies the system
- Querying Qdrant with a write operation
- Spawning a subagent for a task

## WHAT DOES NOT REQUIRE CONFIRMATION

- Reading files
- Querying Qdrant with read-only operations
- Drafting content for review (draft is not action)
- Presenting a plan before execution
- Asking clarifying questions
- Web searches

## THE CONFIRMATION FORMAT

Every agent, before any confirmed action, presents this:

PLAN — [Agent Name]

Task: [what this agent is about to do]
Method: [how it will do it]
Files affected: [which files will be written or modified]
Tools to be called: [which tools will fire]
Output: [what will be produced]
Reversible: [yes / no — if no, extra caution applied]

Waiting for your approval before proceeding.

[YES to proceed / NO to cancel / MODIFY to change the plan]

## AFTER CONFIRMATION

Agent executes.

Agent reports completion with:

- What was done
- What was produced
- What was logged
- What the next logical step is

## CHAIN CONFIRMATION

When OPEX delegates to multiple agents in sequence:

- OPEX presents the full delegation plan first
- User approves the overall plan
- Each subagent still presents its own plan before acting
- User can stop the chain at any point
