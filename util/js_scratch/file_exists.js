const fs = require('fs')

const path = '../../backend/views/partials/sheets/csprofessors.hbs'

try {
  if (fs.existsSync(path)) {
    console.log('file exists! ',path)
  }
} catch(err) {
  console.error(err)
}