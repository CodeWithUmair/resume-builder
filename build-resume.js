/**
 * Resume Builder — accepts JSON via --data argument
 * Usage: node build-resume.js --data '{"name":"...","..."}' --output ./out.docx
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, LevelFormat, UnderlineType, TabStopType,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── Parse CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const dataIdx = args.indexOf('--data');
const outIdx  = args.indexOf('--output');

if (dataIdx === -1) {
  console.error('Usage: node build-resume.js --data \'{"...":"..."}\' --output ./resume.docx');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(args[dataIdx + 1]);
} catch (e) {
  console.error('Invalid JSON in --data:', e.message);
  process.exit(1);
}

const outputPath = outIdx !== -1 ? args[outIdx + 1] : './resume.docx';

// ── Data destructure with defaults ─────────────────────────────
const {
  name          = "UMAIR AMIR",
  title         = "Full Stack Engineer · AI Integration Specialist",
  phone         = "+92-316-8946190",
  email         = "codewithumair867@gmail.com",
  portfolio     = "umairamir.com",
  github        = "github.com/CodeWithUmair",
  linkedin      = "linkedin.com/in/umair-amir",
  summary       = "",
  skills        = {},   // { frontend, backend, ai, database, devops }
  experience    = [],   // [{ company, role, dates, bullets: [] }]
  projects      = [],   // [{ name, tech, bullets: [] }]
  education     = "BS Computer Science | Virtual University of Pakistan"
} = data;

// ── Style constants ─────────────────────────────────────────────
const FONT  = "Lora";
const BLACK = "1a1a1a";
const GRAY  = "555555";
const BLUE  = "1155CC";

// ── Builder helpers ─────────────────────────────────────────────
const gap = (before = 0, after = 100) =>
  new Paragraph({ spacing: { before, after }, children: [] });

const sectionHeader = (text) => new Paragraph({
  spacing: { before: 180, after: 40 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "888888", space: 2 } },
  children: [new TextRun({ text: text.toUpperCase(), font: FONT, size: 22, bold: true, color: BLACK })]
});

const bulletPara = (text) => {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  parts.forEach(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), font: FONT, size: 20, bold: true, color: BLACK }));
    } else {
      runs.push(new TextRun({ text: part, font: FONT, size: 20, color: BLACK }));
    }
  });
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 30, after: 30 },
    children: runs
  });
};

const jobHeader = (company, role, dates) => new Paragraph({
  spacing: { before: 140, after: 30 },
  tabStops: [{ type: TabStopType.RIGHT, position: 9200 }],
  children: [
    new TextRun({ text: company, font: FONT, size: 21, bold: true, color: BLACK }),
    new TextRun({ text: "  |  " + role, font: FONT, size: 20, color: BLACK }),
    new TextRun({ text: "\t" + dates, font: FONT, size: 19, italics: true, color: GRAY })
  ]
});

const skillRow = (label, value) => value ? new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 28, after: 28 },
  children: [
    new TextRun({ text: label + ": ", font: FONT, size: 20, bold: true, color: BLACK }),
    new TextRun({ text: value, font: FONT, size: 20, color: BLACK })
  ]
}) : null;

// ── Build document ──────────────────────────────────────────────
const children = [
  // Name
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 50 },
    children: [new TextRun({ text: name, font: FONT, size: 52, bold: true, color: BLACK })]
  }),
  // Title
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 70 },
    children: [new TextRun({ text: title, font: FONT, size: 22, color: GRAY })]
  }),
  // Contact bar — single row with real clickable hyperlinks
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA", space: 2 } },
    children: [
      new TextRun({ text: phone, font: FONT, size: 16, color: "333333" }),
      new TextRun({ text: "  ·  ", font: FONT, size: 16, color: "888888" }),
      new ExternalHyperlink({
        link: "mailto:" + email,
        children: [new TextRun({ text: email, font: FONT, size: 16, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
      new TextRun({ text: "  ·  ", font: FONT, size: 16, color: "888888" }),
      new ExternalHyperlink({
        link: "https://" + linkedin,
        children: [new TextRun({ text: linkedin, font: FONT, size: 16, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
      new TextRun({ text: "  ·  ", font: FONT, size: 16, color: "888888" }),
      new ExternalHyperlink({
        link: "https://" + github,
        children: [new TextRun({ text: github, font: FONT, size: 16, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
      new TextRun({ text: "  ·  ", font: FONT, size: 16, color: "888888" }),
      new ExternalHyperlink({
        link: "https://" + portfolio,
        children: [new TextRun({ text: portfolio, font: FONT, size: 16, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
    ]
  }),
  gap(0, 80),
];

// Summary
if (summary) {
  children.push(sectionHeader("Summary"));
  children.push(new Paragraph({
    spacing: { before: 70, after: 50 },
    children: [new TextRun({ text: summary, font: FONT, size: 20, color: BLACK })]
  }));
}

// Skills
const skillRows = [
  skillRow("Frontend",  skills.frontend),
  skillRow("Backend",   skills.backend),
  skillRow("AI / LLM",  skills.ai),
  skillRow("Database",  skills.database),
  skillRow("DevOps",    skills.devops),
].filter(Boolean);

if (skillRows.length) {
  children.push(sectionHeader("Technical Skills"));
  skillRows.forEach(r => children.push(r));
}

// Experience
if (experience.length) {
  children.push(sectionHeader("Professional Experience"));
  experience.forEach(({ company, role, dates, bullets }) => {
    children.push(jobHeader(company, role, dates));
    (bullets || []).forEach(b => children.push(bulletPara(b)));
  });
}

// Projects
if (projects.length) {
  children.push(sectionHeader("Key Projects"));
  projects.forEach(({ name: pName, tech, bullets }) => {
    children.push(new Paragraph({
      spacing: { before: 120, after: 25 },
      children: [
        new TextRun({ text: pName, font: FONT, size: 21, bold: true, color: BLACK }),
        tech ? new TextRun({ text: "  |  " + tech, font: FONT, size: 19, italics: true, color: GRAY }) : new TextRun("")
      ]
    }));
    (bullets || []).forEach(b => children.push(bulletPara(b)));
  });
}

// Education
if (education) {
  children.push(sectionHeader("Education"));
  children.push(new Paragraph({
    spacing: { before: 80, after: 30 },
    children: [new TextRun({ text: education, font: FONT, size: 20, color: BLACK })]
  }));
}

// ── Assemble and write ──────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } }
      }]
    }]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 720, bottom: 1080, left: 720 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, buf);
  console.log('✓ Resume written to:', outputPath);
}).catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
