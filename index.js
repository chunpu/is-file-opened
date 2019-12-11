var Opened = require('@ronomon/opened')
var path = require('path')
var child = require('child_process')

var fastLsofBinary = path.join(__dirname, './vendor/fast_lsof')

function detectFiles(files) {
  var platform = process.platform
  if (platform === 'darwin') {
    return macLsof(files)
  } else {
    return OpenedPromise(files)
  }
}

function detectFile(file) {
  return detectFiles([file]).then(function(result) {
    return result[file]
  })
}

function OpenedPromise(files) {
  return new Promise(function(resolve, reject) {
    Opened.files(files, function(err, ret) {
      if (err) {
        return reject(err)
      }
      resolve(ret)
    })
  })
}

function macLsof(files) {

  return new Promise(function(resolve, reject) {
    child.execFile(fastLsofBinary, files, { maxBuffer: 4 * 1024 * 1024 }, function(err, stdout, srderr) {
      var ret = {}
      var nameMap = {}
      if (stdout) {
        var lsofResults = parseLsofRaw(stdout)
        var nameMap = getLsofNameMap(lsofResults) || {}
      }
      files.forEach(function(file) {
        ret[file] = !!nameMap[file]
      })
      resolve(ret)
    })
  })
}

function parseLsofRaw(text) {
  text = text || ''
  text = text.trim()
  var lines = text.split('\n')
  var headerLine = lines[0]
  var resultLines = lines.slice(1)
  var headers = headerLine.split(/\s+/).map(function(item) {
    return item.toLowerCase()
  })
  resultLines = resultLines.map(function(line) {
    var obj = {}
    var arr = line.split(/\s+/)
    arr.forEach(function(item, i) {
      obj[headers[i]] = arr[i]
    })
    return obj
  })
  return resultLines
}

function getLsofNameMap(results) {
  var ret = {}
  results.forEach(function(item) {
    ret[item.name] = item
  })
  return ret
}

exports.detectFiles = detectFiles
exports.detectFile = detectFile
exports.parseLsofRaw = parseLsofRaw
exports.fastLsofBinary = fastLsofBinary
