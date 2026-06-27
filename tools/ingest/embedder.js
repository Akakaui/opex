#!/usr/bin/env node

/**
 * Embedder - Creates vector embeddings via Ollama
 * 
 * Usage:
 *   node embedder.js embed "text to embed"
 *   node embedder.js embed-batch "text1" "text2" "text3"
 * 
 * Uses nomic-embed-text model (768 dimensions)
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function embed(text) {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });
  
  const data = await response.json();
  return data.embedding;
}

async function embedBatch(texts) {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await embed(text));
  }
  return embeddings;
}

// CLI
if (require.main === module) {
  const [,, command, ...args] = process.argv;

  async function main() {
    switch (command) {
      case 'embed':
        const embedding = await embed(args.join(' '));
        console.log(JSON.stringify(embedding));
        break;
      case 'embed-batch':
        const embeddings = await embedBatch(args);
        console.log(JSON.stringify(embeddings));
        break;
      default:
        console.log('Usage: node embedder.js <command> [args...]');
        console.log('Commands: embed, embed-batch');
    }
  }
  
  main().catch(console.error);
}

module.exports = { embed, embedBatch };
