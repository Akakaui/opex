import { mkdirSync, writeFileSync, existsSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, 'templates');

export async function runOnboarding(answers) {
  const root = process.cwd();
  const agentName = answers.name || 'opex';

  if (answers.installOpencode) {
    installOpenCode(root, agentName, answers);
  }

  if (answers.installClaude) {
    installClaudeCode(root, agentName, answers);
  }
}

function installOpenCode(root, agentName, answers) {
  const dir = join(root, '.opex');
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(dir, 'config'), { recursive: true });
  mkdirSync(join(dir, 'agents'), { recursive: true });
  mkdirSync(join(dir, 'skills'), { recursive: true });
  mkdirSync(join(dir, 'memory'), { recursive: true });
  mkdirSync(join(dir, 'knowledge'), { recursive: true });

  // Copy agents with custom name
  const agentsTemplateDir = join(TEMPLATES_DIR, 'opencode', 'agents');
  copyAgentWithRename(agentsTemplateDir, join(dir, 'agents'), agentName);

  // Copy skills
  const skillsTemplateDir = join(TEMPLATES_DIR, 'opencode', 'skills');
  copyDirSync(skillsTemplateDir, join(dir, 'skills'));

  // Generate config files
  writeFileSync(join(dir, 'config/user.config.md'), generateUserConfig(agentName, answers));
  writeFileSync(join(dir, 'config/models.config.md'), generateModelsConfig());
  writeFileSync(join(dir, 'config/tools.config.md'), generateToolsConfig());

  // Generate memory files
  writeFileSync(join(dir, 'memory/goals.memory.md'), generateGoalsMemory(answers));
  writeFileSync(join(dir, 'memory/performance.memory.md'), '# Performance Memory\n\nNo data yet.\n');
  writeFileSync(join(dir, 'memory/sessions.memory.md'), '# Sessions Memory\n\nNo sessions yet.\n');

  console.log('  ✓ OpenCode installed to .opex/');
}

function installClaudeCode(root, agentName, answers) {
  const claudeDir = join(root, '.claude');
  const agentsDir = join(claudeDir, 'agents');
  mkdirSync(agentsDir, { recursive: true });

  // Copy Claude agents with custom name
  const agentsTemplateDir = join(TEMPLATES_DIR, 'claude', 'agents');
  copyAgentWithRename(agentsTemplateDir, agentsDir, agentName);

  // Copy CLAUDE.md
  copyFileSync(join(TEMPLATES_DIR, 'claude', 'CLAUDE.md'), join(claudeDir, 'CLAUDE.md'));

  console.log('  ✓ Claude Code installed to .claude/');
}

function copyAgentWithRename(srcDir, destDir, agentName) {
  const files = readdirSync(srcDir);

  for (const file of files) {
    if (file === 'opex.md') {
      // Rename the main orchestrator
      const content = join(srcDir, file);
      const contentStr = require('fs').readFileSync(content, 'utf-8');
      const renamed = contentStr.replace(/^name: opex$/m, `name: ${agentName}`);
      writeFileSync(join(destDir, `${agentName}.md`), renamed);
    } else {
      copyFileSync(join(srcDir, file), join(destDir, file));
    }
  }
}

function copyDirSync(src, dest) {
  mkdirSync(dest, { recursive: true });
  const files = readdirSync(src);

  for (const file of files) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function generateUserConfig(agentName, a) {
  return `# USER CONFIGURATION

Last updated: ${new Date().toISOString().split('T')[0]}
Version: 1

## Identity

Name: ${a.name || agentName}
Business: ${a.business || 'creator/coach'}
Goal: ${a.goal || 'build an audience and generate leads'}

## Platforms

${a.platforms.map(p => `${p}: [your_handle]`).join('\n') || 'No platforms specified'}

## Brand

Background: #0A0A0A
Card: #141414
Accent: #FF6500 (ONE per design)
Text: #FFFFFF primary, #A0A0A0 secondary
Font: Montserrat
`;
}

function generateModelsConfig() {
  return `# MODELS CONFIGURATION

Last updated: ${new Date().toISOString().split('T')[0]}

## Model Routing

Orchestrator: google/gemini-2.5-pro
Content: anthropic/claude-haiku-4-5
Design: google/gemini-2.5-flash
Research: google/gemini-2.5-flash
Video: google/gemini-2.5-flash
Sales: anthropic/claude-haiku-4-5
`;
}

function generateToolsConfig() {
  return `# TOOLS CONFIGURATION

Last updated: ${new Date().toISOString().split('T')[0]}

## Available Tools

Document: ~/.opex/tools/document/
- pdf.js — PDF generation
- docx.js — Word document generation
- html2pdf.js — HTML to PDF

Export: ~/.opex/tools/export.py
- Playwright PNG export

MCP: ~/.opex/tools/mcp/
- transcribe-server.js — YouTube transcription
`;
}

function generateGoalsMemory(answers) {
  return `# GOALS MEMORY

Last updated: ${new Date().toISOString().split('T')[0]}

## Active Goals

1. North star: ${answers.goal || 'build an audience and generate leads'}
2. Content: Post consistently on ${answers.platforms.join(', ') || 'selected platforms'}
3. Business: Grow ${answers.business || 'creator/coach'} brand

## Milestones

- [ ] Set up content calendar
- [ ] First 30 days of content
- [ ] First lead/sale
`;
}
