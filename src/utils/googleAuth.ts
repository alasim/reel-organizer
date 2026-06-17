const CLIENT_ID = '1004311622596-nhbbs9269fh34tteimmec8eubknj23ql.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata email profile';
const STORAGE_KEY = 'reel_organizer_google_auth';

interface StoredAuth {
  access_token: string;
  expiry: number;
  email?: string;
}

declare const google: any;

let _tokenClient: any = null;

function _getStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function _saveStored(auth: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function isConnected(): boolean {
  return _getStored() !== null;
}

export function isTokenValid(): boolean {
  const stored = _getStored();
  if (!stored) return false;
  return Date.now() < stored.expiry;
}

export function getValidToken(): string | null {
  const stored = _getStored();
  if (!stored || Date.now() >= stored.expiry) return null;
  return stored.access_token;
}

export function getConnectedEmail(): string | null {
  return _getStored()?.email ?? null;
}

export function requestToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof google === 'undefined') {
      resolve(null);
      return;
    }

    const handleResponse = async (response: any) => {
      if (response.error || !response.access_token) {
        resolve(null);
        return;
      }

      const expiry = Date.now() + (response.expires_in - 60) * 1000;

      let email: string | undefined;
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
        const data = await res.json();
        email = data.email;
      } catch { }

      _saveStored({ access_token: response.access_token, expiry, email });
      resolve(response.access_token);
    };

    if (!_tokenClient) {
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: handleResponse,
      });
    } else {
      // Update callback for this call
      _tokenClient.callback = handleResponse;
    }

    _tokenClient.requestAccessToken({ prompt: isConnected() ? '' : 'consent' });
  });
}

export function disconnect() {
  const stored = _getStored();
  if (stored?.access_token && typeof google !== 'undefined') {
    try { google.accounts.oauth2.revoke(stored.access_token, () => { }); } catch { }
  }
  localStorage.removeItem(STORAGE_KEY);
  _tokenClient = null;
}
