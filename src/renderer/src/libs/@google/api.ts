const SPREADSHEET_ID = '162LL6f9m6eqdrp-mwTszewskI0y_Y7OuQRPUNuO2WUI'
const SHEET_RANGE = 'Sheet1!A:Z'

// Paste your service account credentials directly (or import from a config)
// const CLIENT_EMAIL = 'your-service-account@project.iam.gserviceaccount.com'
// const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n`

// ── JWT helpers ────────────────────────────────────────────────────────────────

function b64url(str: ArrayBuffer | string): string {
  const bytes = typeof str === 'string' ? new TextEncoder().encode(str) : new Uint8Array(str)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function getCredentials() {
  const res = await fetch('/data/credentials.json')
  if (!res.ok) throw new Error('Could not load config.json')
  return res.json() as Promise<{ client_email: string; private_key: string }>
}

async function signJwt(email: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    })
  )

  const signingInput = `${header}.${payload}`

  // Strip PEM headers and decode
  const pemBody = privateKeyPem.replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g,
    ''
  )
  const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  return `${signingInput}.${b64url(signature)}`
}

async function getAccessToken(): Promise<string> {
  const { client_email, private_key } = await getCredentials()
  const jwt = await signJwt(client_email, private_key)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  const json = await res.json()
  if (!json.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(json))
  return json.access_token
}

// ── Sheets helpers ─────────────────────────────────────────────────────────────

async function sheetsGet(token: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function sheetsAppend(token: string, values: string[][]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=RAW`
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  })
}

async function sheetsUpdate(token: string, row: number, values: string[][]) {
  const range = `Sheet1!A${row}:Z${row}`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`
  await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  })
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function syncData(machineId: string, data: unknown): Promise<void> {
  const token = await getAccessToken()

  const existing = await sheetsGet(token)
  const rows: string[][] = existing.values || []
  const rowIndex = rows.findIndex((row) => row[0] === machineId)

  const newRow = [machineId, new Date().toISOString(), JSON.stringify(data)]

  if (rowIndex === -1) {
    await sheetsAppend(token, [newRow])
  } else {
    await sheetsUpdate(token, rowIndex + 1, [newRow])
  }

  console.log(`Synced for machine: ${machineId}`)
}
