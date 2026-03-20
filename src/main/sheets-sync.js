import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const SPREADSHEET_ID = '162LL6f9m6eqdrp-mwTszewskI0y_Y7OuQRPUNuO2WUI'
const SHEET_RANGE = 'Sheet1!A:Z'
const DATA_FILE = app.isPackaged
  ? path.join(path.dirname(app.getPath('exe')), 'data.json')
  : path.join(process.cwd(), 'data.json')

const credentials = {
  type: 'service_account',
  project_id: 'unknown-388102',
  private_key_id: 'e08235e391d7c7f9c38d26e786f4a0b5174dedcc',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4KfEneP5+SKH0\nzygHNkOInP38OaQjGaVusY0ydPZNTA59NfT4/gMe9HzALFppyAWm915gmll2rRnB\nGycCR+92CrgPSU5TTeM7A+RX+RJx7dqRQgFWgYgcRWO1stBCtefWHZkfdT9pZ4by\nrtemG+LhrnNUSwCBu+pQx1jqoLS88jxG6lRAtV02AgJc+oWA3M/OSgGPB1B11UtB\n1QpcmqmEdkPUZd5RpmB+yV4VbFlbCIcgIrb4+Z5xS68cU+Q0bu7HIC/cSU22QmEl\n7QM7syEFW+n9AKJ7czeHH4HLpNay4XOOurgw7C6pAXU2GYQDV/aaQ7tRGOab4gJ2\n5PljGE0NAgMBAAECggEAScF9cPPe/31q1S20geA41iOCwTIIfH4k0u9mPbbRdUvD\niqc8tbwZBVw4r4z/Gi1esK8Yl7GIIWN1IhWF1IG4w+aPqctpwgyGGoYfmZ3nQ4Ej\n0sRBTYqV/4EID3qjtxAFZXfKiLT6McOZMguRAEeNePG2STk5X1WQYI2++Yzl6rmm\nJ3bJqZMlMTOCXi5siTDlzz/LGNvnqnJAhR5qIdtPQQ+KJG7PyAVakxm9QE/DusDb\nbxFwRrGmYL86cRSqfPY535ikckIv/bOtdZJ2RIKhOJCcS9VcR2UuYvEOGvSMcNir\n5hdUU9ywwrf0lfzUGCjWfkyHVvR0so0LNigFVoBG6QKBgQD+n23qSB+sKjm5oH9l\npwJXFuPbGOHREjjpd67RKJ3G8RBjGCI9MitYqSpHZf3tmuB9GRwlHe+C0iqwQmHe\ngnYGKRX9SIuY+ntGSpKqOzf5F/UrBoqbtjREXptXVeT+xuJoaNPSDatLPqyP8EIk\nH6KtyYXectr9FUhjLPiwLqgPTwKBgQD5gZGw3Bs2+A7/0qE0GKiDzqQg0+VM1h0y\ngmBF3pDBgMbpBBCvJhb6Xrm2NvmoXAZqtWVdrRDtnaLBEzVLQMZtrgPV9Z88tnjq\nNhEyFfHrgZq6fP9lXTZ2WbRwidmBr2sl+eIH0h8MzCH2XAjRTQYvMqTRIAMkIWby\nIG1o5iMm4wKBgEAODZG9uTIPoVwAc2w4Oo98M7A/rzdwdR7OvAzkQeT1aiDzxlFM\n2LjCPd+eWeY3azgtY/Y2dLWdd53F5WcbvONJ3L1OTcgbY33IbuMiaK9ihovfZmlL\nyhRVFJFBC43IrNaFYJxcUfZo+vJvB8ScrMk5hFL05AB9JSvF+X4hDqhjAoGBALCL\nAa+GzqricpqJSw81s2cwO+oOhN0NU7N9lOlbRknk+Nm/yp5j8TZO+FD6LUT3eILg\nv0y9PJElTRgYo0kQGFdbHdOy7G1lH8F5aElsRbVCC12RPJVYk0TCzG4k3AZrPQGu\nAkVOZDIF7rIHBSYzvgB/cSeX4yEZkWIZl9D1pkHJAoGAF/c84Mv7maKeSGGWI2rH\nI2iMBVetXYZuhzG3IUUdktkTWmdnQ3IpkIIwf/h/c8Byc/VmoSFw2QRZckdiN3ot\nWbAvkOI55vpkkykc8w8Es65Zp/8gKMm5zXTPdbYZmtrJoTYC8vd7aWYwUmx+xjJR\ns+tC6POWssvg0L/iVypmQtg=\n-----END PRIVATE KEY-----\n',
  client_email: 'dg-retail@unknown-388102.iam.gserviceaccount.com',
  client_id: '118374325366028797562',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/dg-retail%40unknown-388102.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com'
}

let _machineId = null

export function init(machineId) {
  _machineId = machineId
}

function getAuth() {
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
