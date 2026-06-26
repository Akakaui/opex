#!/usr/bin/env node

/**
 * HTML to PDF Generation Script
 * Creates professional PDFs from styled HTML using Playwright
 * 
 * Usage:
 *   node html2pdf.js --input content.html --output report.pdf
 *   node html2pdf.js --input content.html --output report.pdf --pageSize A4 --margin 1in
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function parseArgs(args) {
  const result = {};
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    result[key] = args[i + 1];
  }
  return result;
}

function parseMargin(margin) {
  if (!margin) return { top: '1in', bottom: '1in', left: '1in', right: '1in' };
  
  if (typeof margin === 'number') {
    return { top: margin, bottom: margin, left: margin, right: margin };
  }
  
  // Parse "top right bottom left" or "vertical horizontal" or "all"
  const parts = margin.split(' ').map(m => m.trim());
  
  if (parts.length === 1) {
    return { top: parts[0], bottom: parts[0], left: parts[0], right: parts[0] };
  } else if (parts.length === 2) {
    return { top: parts[0], bottom: parts[0], left: parts[1], right: parts[1] };
  } else if (parts.length === 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }
  
  return { top: '1in', bottom: '1in', left: '1in', right: '1in' };
}

async function htmlToPdf(htmlContent, outputPath, options = {}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set content
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  // Wait for fonts to load
  await page.waitForTimeout(options.waitMs || 3000);
  
  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: options.pageSize || 'A4',
    margin: parseMargin(options.margin),
    printBackground: options.printBackground !== 'false',
    displayHeaderFooter: options.headerFooter === 'true',
    headerTemplate: options.header || '<div></div>',
    footerTemplate: options.footer || '<div style="font-size: 10px; text-align: center; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    preferCSSPageSize: options.preferCSSPageSize === 'true'
  });
  
  await browser.close();
  return outputPath;
}

function wrapInTemplate(html, options = {}) {
  const darkMode = options.darkMode === 'true';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', 'Montserrat', -apple-system, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: ${darkMode ? '#FFFFFF' : '#000000'};
      background: ${darkMode ? '#0A0A0A' : '#FFFFFF'};
      padding: 0;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${darkMode ? '#FFFFFF' : '#000000'};
    }
    
    h1 { font-size: 28pt; }
    h2 { font-size: 22pt; }
    h3 { font-size: 16pt; }
    h4 { font-size: 14pt; }
    
    p {
      margin-bottom: 1em;
      text-align: justify;
    }
    
    .accent { color: #FF6500; }
    .secondary { color: ${darkMode ? '#A0A0A0' : '#666666'}; }
    
    code {
      font-family: 'Fira Code', 'Courier New', monospace;
      background: ${darkMode ? '#141414' : '#F5F5F5'};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    pre {
      background: ${darkMode ? '#141414' : '#F5F5F5'};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    blockquote {
      border-left: 4px solid #FF6500;
      padding-left: 16px;
      margin: 1em 0;
      color: ${darkMode ? '#A0A0A0' : '#666666'};
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    th, td {
      padding: 10px 12px;
      border: 1px solid ${darkMode ? '#333333' : '#E0E0E0'};
      text-align: left;
    }
    
    th {
      background: ${darkMode ? '#141414' : '#F5F5F5'};
      font-weight: 600;
    }
    
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    li {
      margin-bottom: 0.5em;
    }
    
    a {
      color: #FF6500;
      text-decoration: none;
    }
    
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    
    .cover h1 {
      font-size: 36pt;
      margin-bottom: 0.5em;
    }
    
    .cover .subtitle {
      font-size: 18pt;
      color: ${darkMode ? '#A0A0A0' : '#666666'};
    }
    
    .cover .accent {
      font-size: 14pt;
      color: #FF6500;
      margin-top: 2em;
    }
    
    @media print {
      body { background: white; }
      .page-break { page-break-after: always; }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv);
  
  if (!args.input || !args.output) {
    console.error('Usage: node html2pdf.js --input <content.html> --output <output.pdf>');
    console.error('Options:');
    console.error('  --pageSize    Page size (A4, Letter, etc.)');
    console.error('  --margin      Margin (e.g., "1in" or "1in 0.5in")');
    console.error('  --darkMode    Use dark background (true/false)');
    console.error('  --headerFooter Show page numbers (true/false)');
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  let html = fs.readFileSync(inputPath, 'utf-8');
  
  // Wrap in template if not full HTML
  if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
    html = wrapInTemplate(html, {
      darkMode: args.darkMode || 'false'
    });
  }

  const options = {
    pageSize: args.pageSize || 'A4',
    margin: args.margin || '1in',
    printBackground: args.printBackground || 'true',
    headerFooter: args.headerFooter || 'true',
    waitMs: parseInt(args.waitMs) || 3000,
    darkMode: args.darkMode || 'false'
  };

  await htmlToPdf(html, outputPath, options);
  console.log(`PDF created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { htmlToPdf, wrapInTemplate };
