const BACKUP_FILENAME = 'reel_organizer_backup.json';
const MIME = 'application/json';

let _fileId: string | null = null;

async function _findFileId(token: string): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D%27${BACKUP_FILENAME}%27&fields=files(id)&pageSize=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function uploadToDrive(
  token: string,
  payload: object
): Promise<{ ok: boolean; error?: string }> {
  try {
    const body = JSON.stringify({
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      ...payload,
    });

    if (!_fileId) {
      _fileId = await _findFileId(token);
    }

    if (_fileId) {
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${_fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': MIME },
          body,
        }
      );
      if (!res.ok) throw new Error(`Drive update failed: ${res.status}`);
    } else {
      const metadata = { name: BACKUP_FILENAME, parents: ['appDataFolder'] };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([body], { type: MIME }));

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
      const data = await res.json();
      _fileId = data.id;
    }

    return { ok: true };
  } catch (e: any) {
    _fileId = null;
    return { ok: false, error: e.message };
  }
}

export async function downloadFromDrive(token: string): Promise<Record<string, any> | null> {
  try {
    const fileId = await _findFileId(token);
    if (!fileId) return null;
    _fileId = fileId;

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
