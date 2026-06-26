#!/usr/bin/env node

/**
 * PDF Generation Script
 * Creates professional PDFs from HTML or structured content
 * 
 * Usage:
 *   node pdf.js --input content.html --output report.pdf
 *   node pdf.js --input content.json --output report.pdf
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Brand colors
const COLORS = {
  background: '#0A0A0A',
  card: '#141414',
  accent: '#FF6500',
  textPrimary: '#000000',
  textSecondary: '#666666',
  white: '#FFFFFF'
};

// Typography
const FONTS = {
  heading: 'Helvetica-Bold',
  body: 'Helvetica',
  code: 'Courier'
};

function parseArgs(args) {
  const result = {};
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    result[key] = args[i + 1];
  }
  return result;
}

function createPDF(content, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: options.pageSize || 'A4',
      margins: {
        top: options.marginTop || 72,
        bottom: options.marginBottom || 72,
        left: options.marginLeft || 72,
        right: options.marginRight || 72
      },
      info: {
        Title: options.title || 'Document',
        Author: options.author || 'OPEX Stack',
        Creator: 'OPEX Document Generator'
      }
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Add cover page if requested
    if (options.coverPage) {
      doc.fontSize(32).font(FONTS.heading).text(options.title || 'Document', {
        align: 'center'
      });
      doc.moveDown(2);
      doc.fontSize(14).font(FONTS.body).text(options.subtitle || '', {
        align: 'center'
      });
      doc.moveDown(1);
      doc.fontSize(12).text(options.date || new Date().toLocaleDateString(), {
        align: 'center'
      });
      doc.addPage();
    }

    // Process content
    if (typeof content === 'string') {
      // Plain text
      doc.fontSize(12).font(FONTS.body).text(content);
    } else if (Array.isArray(content)) {
      // Structured content
      for (const item of content) {
        switch (item.type) {
          case 'heading':
            doc.moveDown(item.level === 1 ? 2 : 1);
            doc.fontSize(item.size || (32 - (item.level - 1) * 4))
               .font(FONTS.heading)
               .text(item.text);
            if (item.accent) {
              doc.moveDown(0.2);
              doc.rect(doc.x, doc.y, 50, 3).fill(COLORS.accent);
              doc.moveDown(0.5);
            }
            break;

          case 'paragraph':
            doc.moveDown(0.5);
            doc.fontSize(item.size || 12)
               .font(FONTS.body)
               .text(item.text, { lineGap: 4 });
            break;

          case 'list':
            doc.moveDown(0.5);
            for (const li of (item.items || [])) {
              doc.fontSize(item.size || 12)
                 .font(FONTS.body)
                 .text(`  •  ${li}`, { indent: 20, lineGap: 2 });
            }
            break;

          case 'code':
            doc.moveDown(0.5);
            doc.save();
            doc.rect(doc.x, doc.y, doc.page.width - 144, 
              (item.text.split('\n').length * 14) + 20)
               .fill(COLORS.card);
            doc.restore();
            doc.fontSize(10).font(FONTS.code).fillColor(COLORS.white)
               .text(item.text, doc.x + 10, doc.y + 10, { lineGap: 2 });
            doc.fillColor(COLORS.textPrimary);
            break;

          case 'divider':
            doc.moveDown(1);
            doc.moveTo(doc.x, doc.y)
               .lineTo(doc.page.width - 72, doc.y)
               .strokeColor(COLORS.textSecondary)
               .stroke();
            doc.moveDown(1);
            break;

          case 'pageBreak':
            doc.addPage();
            break;

          case 'table':
            doc.moveDown(0.5);
            const colWidth = (doc.page.width - 144) / (item.columns || 1);
            const startY = doc.y;
            
            // Header row
            if (item.header) {
              doc.fontSize(10).font(FONTS.heading).fillColor(COLORS.white);
              item.header.forEach((h, i) => {
                doc.text(h, doc.x + (i * colWidth) + 5, startY, { width: colWidth - 10 });
              });
              doc.fillColor(COLORS.textPrimary);
              doc.moveDown(0.8);
            }
            
            // Data rows
            doc.fontSize(10).font(FONTS.body);
            for (const row of (item.rows || [])) {
              const rowY = doc.y;
              row.forEach((cell, i) => {
                doc.text(cell, doc.x + (i * colWidth) + 5, rowY, { width: colWidth - 10 });
              });
              doc.moveDown(0.5);
            }
            break;

          case 'accent':
            doc.moveDown(0.5);
            doc.fontSize(item.size || 14)
               .font(FONTS.heading)
               .fillColor(COLORS.accent)
               .text(item.text);
            doc.fillColor(COLORS.textPrimary);
            break;

          case 'footer':
            // Add to each page
            doc.fontSize(8).font(FONTS.body).fillColor(COLORS.textSecondary);
            doc.text(item.text, 72, doc.page.height - 50, {
              align: 'center',
              width: doc.page.width - 144
            });
            doc.fillColor(COLORS.textPrimary);
            break;
        }
      }
    }

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function main() {
  const args = parseArgs(process.argv);
  
  if (!args.input || !args.output) {
    console.error('Usage: node pdf.js --input <content.html|json> --output <output.pdf>');
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'utf-8');
  let parsed;

  if (inputPath.endsWith('.json')) {
    parsed = JSON.parse(content);
  } else {
    parsed = content;
  }

  const options = {
    title: args.title || 'Document',
    subtitle: args.subtitle || '',
    author: args.author || 'OPEX Stack',
    pageSize: args.pageSize || 'A4',
    coverPage: args.coverPage === 'true'
  };

  await createPDF(parsed, outputPath, options);
  console.log(`PDF created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createPDF };
