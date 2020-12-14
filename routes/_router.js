const fs = require('fs')

module.exports = fs.readdirSync(__dirname).filter(item => item !== '_router.js').map(item => require('./' + item));