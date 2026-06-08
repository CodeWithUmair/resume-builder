const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

function getAuthClient() {
  const credPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, '../credentials.json');
  const tokenPath = process.env.GOOGLE_TOKEN_PATH || path.join(__dirname, '../.auth-token.json');

  if (!fs.existsSync(credPath)) {
    throw new Error(`credentials.json not found at ${credPath}\nRun: node auth-setup.js`);
  }
  if (!fs.existsSync(tokenPath)) {
    throw new Error(`.auth-token.json not found at ${tokenPath}\nRun: node auth-setup.js`);
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  auth.setCredentials(JSON.parse(fs.readFileSync(tokenPath, 'utf8')));
  return auth;
}

function getDriveClient() {
  return google.drive({ version: 'v3', auth: getAuthClient() });
}

async function findFolder(drive, name, parentId = null) {
  const parentClause = parentId ? `'${parentId}' in parents and ` : '';
  const q = `${parentClause}name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await drive.files.list({ q, fields: 'files(id, name)', pageSize: 10 });
  return (res.data.files || [])[0] || null;
}

async function listSubfolders(drive, parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    orderBy: 'name',
    pageSize: 500,
  });
  return res.data.files || [];
}

async function findFileInFolder(drive, folderId, nameContains) {
  const safe = nameContains.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name contains '${safe}' and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 10,
  });
  return (res.data.files || [])[0] || null;
}

async function readDocAsText(drive, fileId, mimeType) {
  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await drive.files.export({ fileId, mimeType: 'text/plain' });
    return typeof res.data === 'string' ? res.data : String(res.data);
  }
  const res = await drive.files.get({ fileId, alt: 'media' });
  return typeof res.data === 'string' ? res.data : String(res.data);
}

module.exports = { getDriveClient, findFolder, listSubfolders, findFileInFolder, readDocAsText };
