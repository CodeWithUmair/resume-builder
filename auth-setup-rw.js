/**
 * auth-setup-rw.js — Google OAuth2 setup with read/write Drive access.
 *
 * Differences from auth-setup.js:
 *   - Scope is drive (read + write), not drive.readonly, so the resume and cover
 *     letter docs can actually be updated in place.
 *   - Catches the OAuth redirect on a local port instead of asking you to copy a
 *     code out of the browser address bar.
 *
 * Run: node auth-setup-rw.js
 * Then open the printed URL, authorize, and the token is written automatically.
 */

const { google } = require('googleapis');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 53682;
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '.auth-token.json');

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error('credentials.json not found in', __dirname);
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_id, client_secret } = credentials.installed || credentials.web;
const redirectUri = `http://localhost:${PORT}`;
const auth = new google.auth.OAuth2(client_id, client_secret, redirectUri);

const authUrl = auth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',          // force a new refresh token
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.end(`Authorization failed: ${error}. You can close this tab.`);
    console.error('FAILED:', error);
    server.close();
    process.exit(1);
  }
  if (!code) { res.end('Waiting for authorization...'); return; }

  try {
    const { tokens } = await auth.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    res.end('Done. Token saved. You can close this tab and go back to Claude Code.');
    console.log('\nToken saved to', TOKEN_PATH);
    console.log('scope:', tokens.scope);
    console.log('has refresh_token:', Boolean(tokens.refresh_token));
    if (tokens.refresh_token_expires_in) {
      console.log(
        '\nWARNING: this refresh token expires in',
        tokens.refresh_token_expires_in,
        'seconds (~' + Math.round(tokens.refresh_token_expires_in / 86400) + ' days).',
        '\nThat means the OAuth consent screen is still in Testing mode.',
        '\nPublish the app to stop this expiring every week.'
      );
    }
    server.close();
    process.exit(0);
  } catch (e) {
    res.end('Token exchange failed: ' + e.message);
    console.error('FAILED:', e.message);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log('\nListening on ' + redirectUri + ' for the OAuth redirect.');
  console.log('\nOpen this URL in your browser and authorize:\n');
  console.log(authUrl);
  console.log('\nSign in with the Google account that has your "Job Applications" folder.');
});
