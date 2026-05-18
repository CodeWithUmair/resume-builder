/**
 * Cover Letter Builder — accepts JSON via --data argument
 * Usage: node build-cover-letter.js --data '{"date":"...","body":"..."}' --output ./out.docx
 *
 * Expected JSON shape:
 * {
 *   "date": "May 18, 2026",
 *   "paragraphs": ["para 1 text", "para 2 text", "para 3 text"]
 * }
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  UnderlineType,
  TabStopType,
  ExternalHyperlink,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ── CLI args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dataIdx = args.indexOf("--data");
const outIdx = args.indexOf("--output");

if (dataIdx === -1) {
  console.error(
    'Usage: node build-cover-letter.js --data \'{"date":"...","paragraphs":[]}\' --output ./cl.docx',
  );
  process.exit(1);
}

let data;
try {
  data = JSON.parse(args[dataIdx + 1]);
} catch (e) {
  console.error("Invalid JSON in --data:", e.message);
  process.exit(1);
}

const outputPath = outIdx !== -1 ? args[outIdx + 1] : "./cover-letter.docx";

const {
  date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  paragraphs = [],
  company = "",
  jobTitle = "",
} = data;

// ── Style constants ─────────────────────────────────────────────
const FONT = "Lora";
const BLACK = "1a1a1a";
const GRAY = "555555";
const BLUE = "1155CC";

// ── Helpers ─────────────────────────────────────────────────────
const gap = (before = 0, after = 200) =>
  new Paragraph({ spacing: { before, after }, children: [] });

const bodyPara = (text, spacingBefore = 0, spacingAfter = 280) =>
  new Paragraph({
    spacing: { before: spacingBefore, after: spacingAfter },
    children: [new TextRun({ text, font: FONT, size: 22, color: BLACK })],
  });

// ── Build document ──────────────────────────────────────────────
const children = [
  // ── Header: Name ──
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 40 },
    children: [
      new TextRun({
        text: "UMAIR AMIR",
        font: FONT,
        size: 36,
        bold: true,
        color: BLACK,
      }),
    ],
  }),

  // ── Contact line ──
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 0 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 3, color: "AAAAAA", space: 3 },
    },
    children: [
      new ExternalHyperlink({
        link: "mailto:codewithumair867@gmail.com",
        children: [new TextRun({ text: "codewithumair867@gmail.com", font: FONT, size: 19, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
      new TextRun({ text: "   ·   ", font: FONT, size: 19, color: "888888" }),
      new ExternalHyperlink({
        link: "https://umairamir.com",
        children: [new TextRun({ text: "umairamir.com", font: FONT, size: 19, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
      new TextRun({ text: "   ·   ", font: FONT, size: 19, color: "888888" }),
      new ExternalHyperlink({
        link: "https://linkedin.com/in/umair-amir",
        children: [new TextRun({ text: "linkedin.com/in/umair-amir", font: FONT, size: 19, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
    ],
  }),

  gap(0, 480),

  // ── Date ──
  new Paragraph({
    spacing: { before: 0, after: 400 },
    children: [
      new TextRun({
        text: date,
        font: FONT,
        size: 21,
        italics: true,
        color: GRAY,
      }),
    ],
  }),

  // ── Salutation ──
  new Paragraph({
    spacing: { before: 0, after: 280 },
    children: [
      new TextRun({
        text: "Hiring Team" + (company ? `, ${company}` : ""),
        font: FONT,
        size: 22,
        color: BLACK,
      }),
    ],
  }),
];

// ── Body paragraphs ──
paragraphs.forEach((para, i) => {
  if (para && para.trim()) {
    children.push(
      bodyPara(para.trim(), 0, i < paragraphs.length - 1 ? 280 : 480),
    );
  }
});

// ── Sign-off ──
children.push(
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({ text: "Best,", font: FONT, size: 22, color: BLACK }),
    ],
  }),
  new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({
        text: "Umair Amir",
        font: FONT,
        size: 22,
        bold: true,
        color: BLACK,
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 40, after: 0 },
    children: [
      new ExternalHyperlink({
        link: "https://umairamir.com",
        children: [new TextRun({ text: "umairamir.com", font: FONT, size: 20, color: BLUE, underline: { type: UnderlineType.SINGLE } })]
      }),
      new TextRun({
        text: "  ·  +92-316-8946190",
        font: FONT,
        size: 20,
        color: GRAY,
      }),
    ],
  }),
);

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1260, right: 1440, bottom: 1260, left: 1440 },
        },
      },
      children,
    },
  ],
});

// ── Write file ──────────────────────────────────────────────────
Packer.toBuffer(doc)
  .then((buf) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, buf);
    console.log("✓ Cover letter written to:", outputPath);
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
