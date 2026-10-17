// Builds the phonebook frontend and copies the production build to ./dist.
// Written in Node so it works the same in every shell (bash, cmd, PowerShell).
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const frontend = path.resolve(__dirname, '..', process.env.FRONTEND_DIR || '../../part2/phonebook')
const target = path.resolve(__dirname, '..', 'dist')

fs.rmSync(target, { recursive: true, force: true })
execSync('npm install && npm run build', { cwd: frontend, stdio: 'inherit' })
fs.cpSync(path.join(frontend, 'dist'), target, { recursive: true })
console.log(`Copied production build from ${frontend} to ${target}`)
