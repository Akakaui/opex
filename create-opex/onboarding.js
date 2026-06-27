import { mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, 'templates');

export async function runOnboarding(answers) {
  const root = process.cwd();
  const agentName = answers.name || 'opex';
  const homeDir = process.env.HOME || '/root';

  if (answers.installOpencode) {
    installOpenCode(homeDir, agentName, answers);
  }

  if (answers.installClaude) {
    installClaudeCode(homeDir, agentName, answers);
  }
}

function installOpenCode(homeDir, agentName, answers) {
  const dir = join(homeDir, '.config', 'opencode');
  const agentsDir = join(dir, 'agents');
  const skillsDir = join(dir, 'skills');

  mkdirSync(agentsDir, { recursive: true });
  mkdirSync(skillsDir, { recursive: true });

  // Copy agents with custom name
  copyAgentsWithRename(join(TEMPLATES_DIR, 'agents'), agentsDir, agentName);

  // Copy skills
  copyDirSync(join(TEMPLATES_DIR, 'skills'), skillsDir);

  console.log('  ✓ OpenCode installed to ~/.config/opencode/');
}

function installClaudeCode(homeDir, agentName, answers) {
  const claudeDir = join(homeDir, '.claude');
  const agentsDir = join(claudeDir, 'agents');

  mkdirSync(agentsDir, { recursive: true });

  // Copy agents with custom name
  copyAgentsWithRename(join(TEMPLATES_DIR, 'agents'), agentsDir, agentName);

  // Copy CLAUDE.md
  const claudeMd = `# OPEX — AI Business Operating System

## Quick Start

Use \`@${agentName} [your request]\` to invoke the orchestrator.

## Agents

15 specialized agents for content, sales, design, video, and more.

## Brand Specs

- Background: #0A0A0A
- Accent: #FF6500
- Font: Montserrat
`;
  writeFileSync(join(claudeDir, 'CLAUDE.md'), claudeMd);

  console.log('  ✓ Claude Code installed to ~/.claude/');
}

function copyAgentsWithRename(srcDir, destDir, agentName) {
  const files = readdirSync(srcDir);

  for (const file of files) {
    const srcPath = join(srcDir, file);

    if (file === 'opex.md') {
      // Rename the main orchestrator
      const content = readFileSync(srcPath, 'utf-8');
      const renamed = content.replace(/^name: opex$/m, `name: ${agentName}`);
      writeFileSync(join(destDir, `${agentName}.md`), renamed);
    } else {
      copyFileSync(srcPath, join(destDir, file));
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
