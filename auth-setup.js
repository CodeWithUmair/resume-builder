/**
 * auth-setup.js — One-time Google OAuth2 setup
 *
 * Run once: node auth-setup.js
 * Saves .auth-token.json so sync.js can authenticate automatically.
 */

const { google } = require('googleapis');
const readline   = require('readline');
const fs         = require('fs');
const path       = require('path');

const SCOPES          = ['https://www.googleapis.com/auth/drive.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH       = path.join(__dirname, '.auth-token.json');

async function main() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log(`
Google OAuth2 Setup
───────────────────
credentials.json not found. To create it:

1. Go to https://console.cloud.google.com/
2. Create a project (or select an existing one)
3. Go to  APIs & Services → Library → Enable "Google Drive API"
4. Go to  APIs & Services → Credentials → Create Credentials → OAuth client ID
5. Application type: Desktop app  →  Create
6. Click "Download JSON", rename the file to  credentials.json
7. Place it in this folder:
   ${__dirname}

Then run:  node auth-setup.js
`);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = auth.generateAuthUrl({ access_type: 'offline', scope: SCOPES });

  console.log('\nOpen this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nSign in with the Google account that has your "Job Applications" folder.');
  console.log('After authorizing, Google will show a code — paste it here:\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise(resolve => rl.question('Code: ', ans => { rl.close(); resolve(ans.trim()); }));

  const { tokens } = await auth.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  console.log(`\n✓ Token saved to ${TOKEN_PATH}`);
  console.log('You can now run:  node sync.js\n');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
