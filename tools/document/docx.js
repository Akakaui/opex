#!/usr/bin/env node

/**
 * Word Document Generation Script
 * Creates professional .docx files from structured content
 * 
 * Usage:
 *   node docx.js --input content.json --output report.docx
 */

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableRow, TableCell, Table, WidthType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

// Brand colors
const COLORS = {
  accent: 'FF6500',
  textPrimary: '000000',
  textSecondary: '666666',
  white: 'FFFFFF',
  card: '141414'
};

function parseArgs(args) {
  const result = {};
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    result[key] = args[i + 1];
  }
  return result;
}

function createHeading(text, level = 1, options = {}) {
  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4
  };

  return new Paragraph({
    text: text,
    heading: headingMap[level] || HeadingLevel.HEADING_1,
    spacing: { before: level === 1 ? 400 : 200, after: 200 },
    ...(options.alignment && { alignment: AlignmentType[options.alignment] })
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: options.bold || false,
        italics: options.italics || false,
        size: options.size || 24, // 12pt in half-points
        color: options.color || COLORS.textPrimary
      })
    ],
    spacing: { after: options.afterSpacing || 200 },
    ...(options.alignment && { alignment: AlignmentType[options.alignment] })
  });
}

function createBullet(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: options.size || 24
      })
    ],
    bullet: { level: options.level || 0 },
    spacing: { after: 100 }
  });
}

function createTable(headers, rows, options = {}) {
  const colWidth = options.colWidth || 2000;
  
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({
          text: h,
          bold: true,
          size: 20,
          color: COLORS.white
        })]
      })],
      shading: { fill: COLORS.card }
    }))
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({
          text: cell,
          size: 20
        })]
      })]
    }))
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

function createDivider() {
  return new Paragraph({
    children: [],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.textSecondary }
    },
    spacing: { after: 200 }
  });
}

async function createDocx(content, outputPath, options = {}) {
  const children = [];

  // Add cover page if requested
  if (options.coverPage) {
    children.push(
      createHeading(options.title || 'Document', 1, { alignment: 'CENTER' }),
      new Paragraph({ children: [], spacing: { after: 400 } }),
      createParagraph(options.subtitle || '', { 
        size: 28, 
        alignment: 'CENTER',
        color: COLORS.textSecondary 
      }),
      new Paragraph({ children: [], spacing: { after: 200 } }),
      createParagraph(options.date || new Date().toLocaleDateString(), { 
        size: 24, 
        alignment: 'CENTER',
        color: COLORS.textSecondary 
      }),
      new Paragraph({ children: [], spacing: { after: 200 } }),
      createParagraph(options.author || 'OPEX Stack', { 
        size: 24, 
        alignment: 'CENTER',
        color: COLORS.accent 
      })
    );
  }

  // Process content
  if (typeof content === 'string') {
    children.push(createParagraph(content));
  } else if (Array.isArray(content)) {
    for (const item of content) {
      switch (item.type) {
        case 'heading':
          children.push(createHeading(item.text, item.level, item.options));
          break;
        case 'paragraph':
          children.push(createParagraph(item.text, item.options));
          break;
        case 'list':
          for (const li of (item.items || [])) {
            children.push(createBullet(li, item.options));
          }
          break;
        case 'table':
          children.push(createTable(item.headers, item.rows, item.options));
          children.push(new Paragraph({ children: [], spacing: { after: 200 } }));
          break;
        case 'divider':
          children.push(createDivider());
          break;
        case 'accent':
          children.push(createParagraph(item.text, { 
            bold: true, 
            color: COLORS.accent,
            size: item.size || 28
          }));
          break;
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: options.marginTop || 1440, // 1 inch in twips
            bottom: options.marginBottom || 1440,
            left: options.marginLeft || 1440,
            right: options.marginRight || 1440
          }
        }
      },
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

async function main() {
  const args = parseArgs(process.argv);
  
  if (!args.input || !args.output) {
    console.error('Usage: node docx.js --input <content.json> --output <output.docx>');
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const options = {
    title: args.title || 'Document',
    subtitle: args.subtitle || '',
    author: args.author || 'OPEX Stack',
    date: args.date || new Date().toLocaleDateString(),
    coverPage: args.coverPage === 'true'
  };

  await createDocx(content, outputPath, options);
  console.log(`DOCX created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createDocx };
