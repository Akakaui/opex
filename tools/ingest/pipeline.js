#!/usr/bin/env node

/**
 * Pipeline - Orchestrates the full content ingestion flow
 * 
 * Usage:
 *   node pipeline.js <url> [--mode transcript|analysis|deep]
 *   node pipeline.js ingest-file /path/to/file.json
 * 
 * Flow:
 *   1. Extract content from URL
 *   2. Classify to domain
 *   3. Create domain if needed
 *   4. Embed and store in Qdrant
 *   5. Update domain SKILL.md
 */

const fs = require('fs');
const path = require('path');
const { extract } = require('./extractor.js');
const { classifyWithLLM } = require('./classifier.js');
const { embed } = require('./embedder.js');
const { createCollection, collectionExists, upsert, search } = require('./qdrant.js');

const SKILLS_DIR = process.env.SKILLS_DIR || path.join(process.env.HOME, '.config/opencode/skills');
const DOMAINS_FILE = path.join(SKILLS_DIR, 'domain-router/domains.json');

function getDomains() {
  try {
    return JSON.parse(fs.readFileSync(DOMAINS_FILE, 'utf-8'));
  } catch (e) {
    return { domains: [], last_updated: new Date().toISOString() };
  }
}

function saveDomains(domains) {
  const dir = path.dirname(DOMAINS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DOMAINS_FILE, JSON.stringify(domains, null, 2));
}

function getDomainDir(domain) {
  return path.join(SKILLS_DIR, domain);
}

function ensureDomain(domain, classification) {
  const domains = getDomains();
  
  // Check if domain exists
  if (!domains.domains.find(d => d.name === domain)) {
    // Create new domain
    const domainDir = getDomainDir(domain);
    fs.mkdirSync(domainDir, { recursive: true });
    
    // Create SKILL.md
    const skillContent = `# ${classification.platform.toUpperCase()} ${classification.topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} SKILL

Last updated: ${new Date().toISOString().split('T')[0]}
Source: ${classification.platform}
Category: ${classification.topic}
Domain: ${domain}

## Key Patterns

*Knowledge will be added as content is ingested.*

## Frameworks

*Frameworks will be extracted from ingested content.*

## Application

This domain contains patterns and frameworks for ${classification.topic.replace(/-/g, ' ')} on ${classification.platform.toUpperCase()}.

When to use this knowledge:
- Creating ${classification.platform} content about ${classification.topic.replace(/-/g, ' ')}
- Analyzing ${classification.platform} content in this category
- Applying proven patterns from this domain
`;
    fs.writeFileSync(path.join(domainDir, 'SKILL.md'), skillContent);
    
    // Create knowledge.json
    const knowledge = {
      domain: domain,
      created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      patterns: [],
      frameworks: [],
      examples: [],
      sources: [],
    };
    fs.writeFileSync(path.join(domainDir, 'knowledge.json'), JSON.stringify(knowledge, null, 2));
    
    // Add to domains registry
    domains.domains.push({
      name: domain,
      platform: classification.platform,
      topic: classification.topic,
      created: new Date().toISOString(),
      content_count: 0,
    });
    domains.last_updated = new Date().toISOString();
    saveDomains(domains);
    
    // Create Qdrant collection
    createCollection(domain).catch(() => {});
    
    console.log(`  ✓ Created new domain: ${domain}`);
  }
  
  return domain;
}

function updateDomainKnowledge(domain, content, sourceUrl, classification) {
  const domainDir = getDomainDir(domain);
  const knowledgeFile = path.join(domainDir, 'knowledge.json');
  
  let knowledge;
  try {
    knowledge = JSON.parse(fs.readFileSync(knowledgeFile, 'utf-8'));
  } catch (e) {
    knowledge = {
      domain: domain,
      created: new Date().toISOString(),
      patterns: [],
      frameworks: [],
      examples: [],
      sources: [],
    };
  }
  
  // Add example
  knowledge.examples.push({
    source: sourceUrl,
    platform: classification.platform,
    topic: classification.topic,
    ingested: new Date().toISOString(),
    preview: content.substring(0, 500),
  });
  
  // Add source if not exists
  if (!knowledge.sources.find(s => s.url === sourceUrl)) {
    knowledge.sources.push({
      url: sourceUrl,
      platform: classification.platform,
      ingested: new Date().toISOString(),
    });
  }
  
  knowledge.last_updated = new Date().toISOString();
  
  // Save updated knowledge
  fs.writeFileSync(knowledgeFile, JSON.stringify(knowledge, null, 2));
  
  // Update domains registry
  const domains = getDomains();
  const domainEntry = domains.domains.find(d => d.name === domain);
  if (domainEntry) {
    domainEntry.content_count = knowledge.examples.length;
    domainEntry.last_updated = new Date().toISOString();
  }
  domains.last_updated = new Date().toISOString();
  saveDomains(domains);
}

async function ingestContent(url, mode = 'analysis') {
  console.log(`\n  Ingesting: ${url}`);
  console.log(`  Mode: ${mode}`);
  
  // Step 1: Extract content
  console.log('\n  1. Extracting content...');
  const extracted = await extract(url, mode);
  
  if (extracted.error) {
    console.log(`  ✗ Extraction failed: ${extracted.error}`);
    return { success: false, error: extracted.error };
  }
  
  console.log(`  ✓ Extracted: ${extracted.platform || 'unknown'} content`);
  if (extracted.title) {
    console.log(`    Title: ${extracted.title}`);
  }
  
  // Step 2: Classify content
  console.log('\n  2. Classifying content...');
  const contentText = [
    extracted.title,
    extracted.description,
    extracted.transcript,
    extracted.text,
  ].filter(Boolean).join(' ');
  
  const classification = await classifyWithLLM(contentText, url);
  const domain = `${classification.platform}-${classification.topic}`;
  
  console.log(`  ✓ Classified: ${domain} (confidence: ${classification.confidence})`);
  
  // Step 3: Ensure domain exists
  console.log('\n  3. Setting up domain...');
  ensureDomain(domain, classification);
  
  // Step 4: Embed and store
  console.log('\n  4. Embedding and storing...');
  const textToEmbed = contentText.substring(0, 1000); // Limit for embedding
  
  if (textToEmbed.length > 0) {
    try {
      const vector = await embed(textToEmbed);
      const pointId = Date.now(); // Simple ID based on timestamp
      
      await upsert(domain, pointId, vector, {
        content: contentText.substring(0, 5000),
        source_url: url,
        platform: classification.platform,
        topic: classification.topic,
        domain: domain,
        timestamp: Date.now(),
        tags: extracted.tags || [],
      });
      
      console.log(`  ✓ Stored in Qdrant (${domain} collection)`);
    } catch (e) {
      console.log(`  ⚠ Embedding failed: ${e.message}`);
    }
  }
  
  // Step 5: Update domain knowledge
  console.log('\n  5. Updating domain knowledge...');
  updateDomainKnowledge(domain, contentText, url, classification);
  console.log(`  ✓ Updated ${domain}/knowledge.json`);
  
  // Step 6: Extract patterns if in analysis mode
  if ((mode === 'analysis' || mode === 'deep') && extracted.transcript) {
    console.log('\n  6. Extracting patterns...');
    // Patterns would be extracted by LLM in production
    // For now, store raw transcript
    console.log(`  ✓ Transcript stored (${extracted.transcript.length} chars)`);
  }
  
  console.log('\n  ✓ Ingestion complete!');
  
  return {
    success: true,
    domain: domain,
    platform: classification.platform,
    topic: classification.topic,
    title: extracted.title,
  };
}

// CLI
if (require.main === module) {
  const [,, url, ...flags] = process.argv;
  
  if (!url) {
    console.log('Usage: node pipeline.js <url> [--mode transcript|analysis|deep]');
    process.exit(1);
  }
  
  const modeIdx = flags.indexOf('--mode');
  const mode = modeIdx !== -1 ? flags[modeIdx + 1] : 'analysis';
  
  ingestContent(url, mode).then(result => {
    console.log('\nResult:', JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { ingestContent, getDomains, ensureDomain };
