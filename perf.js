var path = require('path')
var isFileOpened = require('./')
var fs = require('fs')

var docFile = path.join(__dirname, '中文test with space.docx')
var COUNT = 1000

async function perf() {
  console.time('wholocks')
  for (var i = 0; i < COUNT; i++) {
    isFileOpened.wholocks(docFile)
  }
  console.timeEnd('wholocks')

  console.time('opened lib')
  for (var i = 0; i < COUNT; i++) {
    isFileOpened.detectFile(docFile)
  }
  console.timeEnd('opened lib')
}

perf()
