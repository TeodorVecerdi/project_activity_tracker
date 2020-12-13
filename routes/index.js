const fs = require('fs')

module.exports = fs.readdirSync(__dirname).filter(item => item !== 'index.js').map(item => require('./' + item));