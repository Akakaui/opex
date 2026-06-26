import { createInterface } from 'readline';

function createTTYPrompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const questions = [];
  let running = false;

  function ask(query) {
    return new Promise(resolve => {
      questions.push({ query, resolve });
      if (!running) processNext();
    });
  }

  function processNext() {
    running = true;
    const q = questions.shift();
    if (!q) { running = false; return; }
    rl.question(q.query, answer => {
      q.resolve(answer.trim());
      processNext();
    });
  }

  function close() { rl.close(); }
  return { ask, close };
}

function createPipePrompt(lines) {
  let idx = 0;
  const out = process.stdout;

  function ask(query) {
    out.write(query);
    const answer = idx < lines.length ? lines[idx++] : '';
    out.write(answer + '\n');
    return Promise.resolve(answer.trim());
  }

  function close() {}
  return { ask, close };
}

function parseMultiSelect(input) {
  return input.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
}

export async function runPrompts() {
  const isTTY = process.stdin.isTTY;

  let prompt;
  if (isTTY) {
    prompt = createTTYPrompt();
  } else {
    const lines = [];
    const rl = createInterface({ input: process.stdin });
    for await (const line of rl) {
      lines.push(line);
    }
    prompt = createPipePrompt(lines);
  }

  try {
    console.log('  Let\'s set up your AI business system.\n');

    const name = await prompt.ask('  ? Agent name (default: opex): ');
    const business = await prompt.ask('  ? Your business/brand: ');
    const goal = await prompt.ask('  ? Main goal (leads, sales, audience): ');

    console.log('');
    console.log('  Install for which platforms?');
    console.log('    1) OpenCode only');
    console.log('    2) Claude Code only');
    console.log('    3) Both (recommended)');
    const platformChoice = await prompt.ask('  ? Choice (1/2/3): ');

    const installOpencode = platformChoice === '1' || platformChoice === '3' || platformChoice === '';
    const installClaude = platformChoice === '2' || platformChoice === '3' || platformChoice === '';

    console.log('');
    const openrouterKey = await prompt.ask('  ? OpenRouter API key (optional, Enter to skip): ');
    const notionKey = await prompt.ask('  ? Notion integration key (optional, Enter to skip): ');

    console.log('');
    console.log('  Content platforms (comma-separated):');
    console.log('    Twitter/X, LinkedIn, YouTube, Instagram, TikTok, Blog');
    const platformsRaw = await prompt.ask('  ? Your platforms: ');
    const platforms = parseMultiSelect(platformsRaw);

    return {
      name: name || 'opex',
      business: business || 'creator/coach',
      goal: goal || 'build an audience and generate leads',
      installOpencode,
      installClaude,
      openrouterKey,
      notionKey,
      platforms,
    };
  } finally {
    prompt.close();
  }
}
