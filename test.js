var path = require('path')
var isFileOpened = require('./')
var fs = require('fs')

var docFile = path.join(__dirname, '中文test with space.docx')
var notExistFile = path.join(__dirname, 'not.exist')
var files = [path.join(__dirname, 'package.json'), docFile, notExistFile]

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

function test4() {
  var ret = isFileOpened.wholocks(docFile)
  console.log('who locks doc file', ret)
}

test()
test2()
test3()
test4()
