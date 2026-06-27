#!/usr/bin/env node

/**
 * Classifier - Determines which domain content belongs to
 * 
 * Uses LLM to classify content into platform + topic domains
 * 
 * Usage:
 *   node classifier.js classify "content text" "source url"
 *   node classifier.js classify-file /path/to/file.json
 */

const fs = require('fs');

// Domain patterns for classification
const DOMAIN_PATTERNS = {
  // Platform patterns
  platforms: {
    ig: ['instagram', 'reel', 'reels', 'ig ', 'insta', 'carousel', 'story'],
    yt: ['youtube', 'video', 'thumbnail', 'channel', 'subscriber', 'watch time'],
    twitter: ['twitter', 'tweet', 'thread', 'x.com', 'retweet', 'follower'],
    tiktok: ['tiktok', 'tok', 'duet', 'stitch', 'fyp'],
    linkedin: ['linkedin', 'post', 'professional', 'b2b', 'networking'],
    blog: ['blog', 'article', 'post', 'seo', 'content marketing'],
    podcast: ['podcast', 'episode', 'interview', 'audio'],
    email: ['email', 'newsletter', 'subject line', 'open rate'],
  },
  
  // Topic patterns
  topics: {
    'viral-hooks': ['viral', 'hook', 'scroll', 'attention', 'stop', 'engage', 'trending'],
    'content-strategy': ['content', 'calendar', 'plan', 'schedule', 'batch', 'repurpose'],
    'sales-closing': ['sale', 'close', 'deal', 'pitch', 'objection', 'offer', 'price'],
    'design': ['design', 'layout', 'color', 'font', 'visual', 'graphic', 'brand'],
    'growth': ['growth', 'follower', 'audience', 'reach', 'expand', 'scale'],
    'monetization': ['money', 'revenue', 'income', 'profit', 'monetize', 'cash'],
    'copywriting': ['copy', 'headline', 'cta', 'persuade', 'write', 'words'],
    'psychology': ['psychology', 'mindset', 'behavior', 'influence', 'trigger'],
    'analytics': ['analytics', 'data', 'metric', 'track', 'measure', 'roi'],
    'automation': ['automate', 'system', 'workflow', 'tool', ' ai ', 'efficiency'],
  },
};

async function classifyWithLLM(content, sourceUrl = '') {
  // Use local LLM or fallback to pattern matching
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `Classify this content into a domain. Return ONLY a JSON object with "platform" and "topic" fields.

Platform options: ig, yt, twitter, tiktok, linkedin, blog, podcast, email, general
Topic options: viral-hooks, content-strategy, sales-closing, design, growth, monetization, copywriting, psychology, analytics, automation, general

Content: ${content.substring(0, 500)}
Source URL: ${sourceUrl}

Return JSON: {"platform": "...", "topic": "...", "confidence": 0.0-1.0}`,
        stream: false,
      }),
    });
    
    const data = await response.json();
    const match = data.response.match(/\{[^}]+\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {
    // LLM not available, use pattern matching
  }
  
  return classifyWithPatterns(content, sourceUrl);
}

function classifyWithPatterns(content, sourceUrl = '') {
  const text = (content + ' ' + sourceUrl).toLowerCase();
  
  let bestPlatform = 'general';
  let bestPlatformScore = 0;
  
  let bestTopic = 'general';
  let bestTopicScore = 0;
  
  // Check platform patterns
  for (const [platform, patterns] of Object.entries(DOMAIN_PATTERNS.platforms)) {
    const score = patterns.filter(p => text.includes(p)).length;
    if (score > bestPlatformScore) {
      bestPlatformScore = score;
      bestPlatform = platform;
    }
  }
  
  // Check topic patterns
  for (const [topic, patterns] of Object.entries(DOMAIN_PATTERNS.topics)) {
    const score = patterns.filter(p => text.includes(p)).length;
    if (score > bestTopicScore) {
      bestTopicScore = score;
      bestTopic = topic;
    }
  }
  
  const confidence = Math.min((bestPlatformScore + bestTopicScore) / 10, 1);
  
  return {
    platform: bestPlatform,
    topic: bestTopic,
    confidence: confidence,
    domain: `${bestPlatform}-${bestTopic}`,
  };
}

// CLI
if (require.main === module) {
  const [,, command, ...args] = process.argv;

  async function main() {
    switch (command) {
      case 'classify':
        const content = args.slice(0, -1).join(' ');
        const url = args[args.length - 1] || '';
        console.log(JSON.stringify(await classifyWithLLM(content, url), null, 2));
        break;
      case 'classify-file':
        const fileContent = fs.readFileSync(args[0], 'utf-8');
        console.log(JSON.stringify(await classifyWithLLM(fileContent), null, 2));
        break;
      default:
        console.log('Usage: node classifier.js <command> [args...]');
        console.log('Commands: classify, classify-file');
    }
  }
  
  main().catch(console.error);
}

module.exports = { classifyWithLLM, classifyWithPatterns, DOMAIN_PATTERNS };
