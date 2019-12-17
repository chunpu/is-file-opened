var path = require('path')
var isFileOpened = require('./')
var fs = require('fs')

var docFile = path.join(__dirname, 'test.docx')
var files = [path.join(__dirname, 'package.json'), docFile]

function test2() {
  isFileOpened.detectFiles(files).then(function(result) {
    console.log('result', result)
  }).catch(err => {
    console.log('crash', err)
  })
}

function test() {
  fs.createReadStream(docFile)
  isFileOpened.detectFile(docFile).then(opened => {
    console.log({ opened })
  }).catch(err => {
    console.log('crash', err)
  })
}

function test3() {
  isFileOpened.lsof(files).then(ret => {
    console.log({ret})
  })
}

test()
test2()
test3()
