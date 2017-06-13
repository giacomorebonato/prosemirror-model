const path = require('path')

module.exports = {
  entry: path.join(__dirname, 'dist/from_dom.js'),
  output: {
    path: path.join(__dirname, 'bundle'),
    filename: "from_dom.bundle.js"
  }
}
