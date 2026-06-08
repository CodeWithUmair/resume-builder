/**
 * sync.js — Fetches job folders from Google Drive and builds local .docx files
 *
 * Commands:
 *   node sync.js --list                         # list all job folder names (nothing built)
 *   node sync.js --job "TechCorp"               # test ONE job — partial name match, case-insensitive
 *   node sync.js --folder Remote                # all Remote jobs
 *   node sync.js --folder Pakistan              # all Pakistan jobs
 *   node sync.js                                # all Remote + Pakistan jobs
 *
 * Flags (combine with any command above):
 *   --force   rebuild .docx even if they already exist
 */

require('dotenv').config();

const { execSync } = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const { getDriveClient, findFolder, listSubfolders, findFileInFolder, readDocAsText } = require('./lib/drive');
const { generateResumeJson } = require('./lib/generate');

const OUTPUT_DIR = path.join(__dirname, 'output');

// ── Arg parsing ──────────────────────────────────────────────────

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] || null : null;
}

// ── Text helpers ─────────────────────────────────────────────────

function parseJobInfo(text) {
  const info = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([^:]+):\s*(.+)$/);
    if (m) info[m[1].trim().toLowerCase().replace(/\s+/g, '_')] = m[2].trim();
  }
  return info;
}

function parseCoverLetterParagraphs(text) {
  const lines = text.split('\n').map(l => l.trim());
  const paragraphs = [];
  let inBody = false;

  for (const line of lines) {
    if (!line) continue;
    if (!inBody) {
      if (/^UMAIR AMIR$/i.test(line)) continue;
      if (line.includes('codewithumair867@gmail.com')) continue;
      if (/umairamir\.com/i.test(line) && line.length < 80) continue;
      if (/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d/i.test(line)) continue;
      if (/^(hiring team|dear |to whom)/i.test(line)) { inBody = true; continue; }
      if (line.length > 60) inBody = true; // fallback: first long line is body
    }
    if (inBody) {
      if (/^(best,?|regards,?|sincerely,?)$/i.test(line)) break;
      if (/^umair amir$/i.test(line)) break;
      if (line.length > 20) paragraphs.push(line);
    }
  }
  return paragraphs;
}

// ── Docx builder ─────────────────────────────────────────────────

function buildDocx(scriptName, dataJson, outputPath) {
  const tmpFile = path.join(os.tmpdir(), `resume-sync-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(dataJson, null, 2));
  try {
    execSync(
      `node "${path.join(__dirname, scriptName)}" --data-file "${tmpFile}" --output "${outputPath}"`,
      { stdio: 'inherit', cwd: __dirname }
    );
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function safeName(str) {
  return str.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').trim();
}

// ── Per-job processing ───────────────────────────────────────────

async function processJob(drive, folder, marketType, force) {
  const safeFolderName = safeName(folder.name);
  const outputBase = path.join(OUTPUT_DIR, marketType, safeFolderName);
  const resumeOut  = path.join(outputBase, 'resume.docx');
  const clOut      = path.join(outputBase, 'cover-letter.docx');

  const resumeExists = fs.existsSync(resumeOut);
  const clExists     = fs.existsSync(clOut);

  if (!force && resumeExists && clExists) {
    console.log(`  ✓ skip  ${folder.name}  (already built — use --force to rebuild)`);
    return 'skipped';
  }

  console.log(`\n  Processing: ${folder.name}`);

  // Read Job Info
  const jobInfoFile = await findFileInFolder(drive, folder.id, 'Job Info');
  if (!jobInfoFile) {
    console.log(`  ⚠ skip  — no "Job Info" file found in this folder`);
    return 'skipped';
  }
  const jobInfoText = await readDocAsText(drive, jobInfoFile.id, jobInfoFile.mimeType);
  const info = parseJobInfo(jobInfoText);

  const company  = info.company  || 'Unknown Company';
  const jobTitle = info.job_title || info.jobtitle
    || folder.name.replace(/^\d{4}-\d{2}-\d{2}\s*-\s*[^-]+-\s*/, '').trim();
  const keywords = info.keywords_used || info.keywords || '';

  console.log(`  Company: ${company}  |  Role: ${jobTitle}`);
  if (keywords) console.log(`  Keywords: ${keywords}`);

  if (!fs.existsSync(outputBase)) fs.mkdirSync(outputBase, { recursive: true });

  // ── Resume ──
  if (force || !resumeExists) {
    console.log(`  → Calling Claude API to tailor resume...`);
    const resumeData = await generateResumeJson(jobTitle, company, keywords, marketType);
    console.log(`  → Building resume.docx...`);
    buildDocx('build-resume.js', resumeData, resumeOut);
    console.log(`  ✓ resume.docx`);
  } else {
    console.log(`  ✓ resume.docx already exists`);
  }

  // ── Cover letter ──
  if (force || !clExists) {
    const clFile = await findFileInFolder(drive, folder.id, 'Cover Letter');
    if (clFile) {
      const clText = await readDocAsText(drive, clFile.id, clFile.mimeType);
      const paragraphs = parseCoverLetterParagraphs(clText);
      if (paragraphs.length > 0) {
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        console.log(`  → Building cover-letter.docx...`);
        buildDocx('build-cover-letter.js', { date: dateStr, company, jobTitle, paragraphs }, clOut);
        console.log(`  ✓ cover-letter.docx`);
      } else {
        console.log(`  ⚠ Cover Letter found but text could not be parsed`);
      }
    } else {
      console.log(`  ⚠ No "Cover Letter" file found — skipping cover letter`);
    }
  } else {
    console.log(`  ✓ cover-letter.docx already exists`);
  }

  console.log(`  → Saved to: output/${marketType}/${safeFolderName}/`);
  return 'done';
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const folderFilter = getArg(args, '--folder');
  const jobFilter    = getArg(args, '--job');
  const force        = args.includes('--force');
  const listOnly     = args.includes('--list');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY in .env — Claude API is needed to tailor each resume');
    process.exit(1);
  }

  console.log('Connecting to Google Drive...');
  const drive = await getDriveClient();

  const rootFolder = await findFolder(drive, 'Job Applications');
  if (!rootFolder) {
    console.error('Could not find "Job Applications" folder in Google Drive');
    process.exit(1);
  }

  const markets = ['Remote', 'Pakistan'].filter(m =>
    !folderFilter || m.toLowerCase() === folderFilter.toLowerCase()
  );

  // ── List mode: just print folder names, nothing built ──
  if (listOnly) {
    for (const market of markets) {
      const marketFolder = await findFolder(drive, market, rootFolder.id);
      if (!marketFolder) continue;
      const jobs = await listSubfolders(drive, marketFolder.id);
      console.log(`\n── ${market} (${jobs.length} jobs) ─────────────────`);
      jobs.forEach((j, i) => console.log(`  ${String(i + 1).padStart(2)}. ${j.name}`));
    }
    return;
  }

  // ── Single-job mode ──
  if (jobFilter) {
    const needle = jobFilter.toLowerCase();
    for (const market of markets) {
      const marketFolder = await findFolder(drive, market, rootFolder.id);
      if (!marketFolder) continue;
      const jobs = await listSubfolders(drive, marketFolder.id);
      const match = jobs.find(j => j.name.toLowerCase().includes(needle));
      if (match) {
        console.log(`\nFound in ${market}: ${match.name}`);
        await processJob(drive, match, market, true); // always force for test run
        return;
      }
    }
    console.error(`No job folder found matching: "${jobFilter}"`);
    console.error(`Run  node sync.js --list  to see available folder names`);
    process.exit(1);
  }

  // ── Full sync mode ──
  let done = 0, skipped = 0, errors = 0;

  for (const market of markets) {
    const marketFolder = await findFolder(drive, market, rootFolder.id);
    if (!marketFolder) { console.log(`\nNo "${market}" folder found — skipping`); continue; }

    const jobs = await listSubfolders(drive, marketFolder.id);
    console.log(`\n── ${market} (${jobs.length} jobs) ─────────────────`);

    for (const folder of jobs) {
      try {
        const result = await processJob(drive, folder, market, force);
        if (result === 'done') done++; else skipped++;
      } catch (err) {
        console.log(`  ✗ error  ${folder.name}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`Built: ${done}  |  Skipped: ${skipped}  |  Errors: ${errors}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
