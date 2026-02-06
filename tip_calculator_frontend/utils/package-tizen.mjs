import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function assertExists(p, label) {
  if (!fs.existsSync(p)) {
    console.error(`[package:tizen] Missing ${label}: ${p}`)
    process.exit(1)
  }
}

function addDirRecursive(zip, dirAbs, baseInZip = '') {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true })
  for (const ent of entries) {
    const abs = path.join(dirAbs, ent.name)
    const rel = baseInZip ? `${baseInZip}/${ent.name}` : ent.name
    if (ent.isDirectory()) {
      addDirRecursive(zip, abs, rel)
    } else if (ent.isFile()) {
      zip.addLocalFile(abs, path.dirname(rel), path.basename(rel))
    }
  }
}

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const configXml = path.join(projectRoot, 'config.xml')
const outWgt = path.join(projectRoot, 'app.wgt')

assertExists(distDir, 'dist directory (run npm run build:tizen first)')
assertExists(configXml, 'config.xml')

console.log('[package:tizen] Creating widget:', outWgt)

const zip = new AdmZip()

// Add dist contents at root of widget
addDirRecursive(zip, distDir)

// Add config.xml at root of widget
zip.addLocalFile(configXml, '', 'config.xml')

zip.writeZip(outWgt)

console.log('[package:tizen] Done. Output:', outWgt)
