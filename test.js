var path = require('path')
var isFileOpened = require('./')

var files = [path.join(__dirname, 'package.json'), path.join(__dirname, 'test.docx')]

isFileOpened.detect(files).then(function(result) {
  console.log('result', result)
}).catch(err => {
  console.log('crash', err)
})

