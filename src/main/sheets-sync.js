import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const SPREADSHEET_ID = '162LL6f9m6eqdrp-mwTszewskI0y_Y7OuQRPUNuO2WUI'
const SHEET_RANGE = 'Sheet1!A:Z'
const DATA_FILE = app.isPackaged
  ? path.join(path.dirname(app.getPath('exe')), 'data.json')
  : path.join(process.cwd(), 'data.json')

const CREDENTIALS_PATH = app.isPackaged
  ? path.join(path.dirname(app.getPath('exe')), 'credentials.json')
  : path.join(process.cwd(), 'credentials.json')

let _machineId = null

export function init(machineId) {
  _machineId = machineId
}

function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'))
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
}

const LOG_FILE = path.join(app.getPath('userData'), 'app.log')

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  fs.appendFileSync(LOG_FILE, line)
  console.log(...args)
}

export async function syncData() {
  if (!_machineId) {
    log('machineId not set, call init() first')
    return
  }

  // Read data.json
  let data
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch (e) {
    log('Could not read data.json:', e.message)
    return
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: getAuth() })

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE
    })

    const rows = existing.data.values || []
    const rowIndex = rows.findIndex((row) => row[0] === _machineId)

    const newRow = [
      _machineId,
      new Date().toISOString(), // lastSynced
      JSON.stringify(data) // the whole data.json content
    ]

    if (rowIndex === -1) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: SHEET_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [newRow] }
      })
    } else {
      const sheetRow = rowIndex + 1
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!A${sheetRow}:Z${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [newRow] }
      })
    }

    log(`Synced data.json for machine: ${_machineId}`)
  } catch (e) {
    log('Sync failed:', e.message)
  }
}
