var Opened = require('@ronomon/opened')
var path = require('path')
var child = require('child_process')

var fastLsofBinary = path.join(__dirname, './vendor/fast_lsof')

function detectFiles(files, opt) {
  var platform = process.platform
  if (platform === 'darwin') {
    return macLsof(files, opt)
  } else {
    return OpenedFilesPromise(files)
  }
}

function detectFile(file, opt) {
  return detectFiles([file], opt).then(function(result) {
    return result[file]
  })
}

function OpenedFilesPromise(files) {
  // opened use limit queue it self in windows
  // https://github.com/ronomon/opened/blob/master/index.js
  return mapLimit(files, OpenedFilePromise, 1).catch(function() {}).then(function(arr) {
    arr = arr || []
    var ret = {}
    files.forEach(function(item, i) {
      ret[files[i]] = !!arr[i]
    })
    return ret
  })
}

function OpenedFilePromise(file) {
  return new Promise(function(resolve, reject) {
    Opened.file(file, function(err, ret) {
      if (err) {
        // return false if crash
        return resolve(false)
      }
      resolve(ret)
    })
  })
}

function lsof(files) {
  return new Promise(function(resolve, reject) {
    child.execFile(fastLsofBinary, files, { maxBuffer: 4 * 1024 * 1024 }, function(err, stdout, stderr) {
      var nameMap = {}
      if (stdout) {
        var lsofResults = parseLsofRaw(stdout)
        resolve(lsofResults)
      }
      resolve([])
    })
  })
}

function macLsof(files, opt) {
  opt = opt || {}
  return new Promise(function(resolve, reject) {
    child.execFile(fastLsofBinary, files, { maxBuffer: 4 * 1024 * 1024 }, function(err, stdout, stderr) {
      var ret = {}
      var nameMap = {}
      if (stdout) {
        var lsofResults = parseLsofRaw(stdout)
        if (typeof opt.afterLsof === 'function') {
          lsofResults = opt.afterLsof(lsofResults)
        }
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
  text = decodeHexText(text)
  text = text.trim()
  var lines = text.split('\n')
  var headerLine = lines[0].toLowerCase()
  var resultLines = lines.slice(1)
  var headers = headerLine.split(/\s+/)
  var nameIndex = headerLine.indexOf('name')
  resultLines = resultLines.map(function(line) {
    var obj = {}
    var arr = line.split(/\s+/)
    headers.forEach(function(item, i) {
      obj[headers[i]] = arr[i]
    })
    obj.name = line.slice(nameIndex) // 文件可能有空格, 但文件名始终和name对齐
    return obj
  })
  return resultLines
}

function decodeHexText(text) {
  try {
    return decodeURIComponent(text.replace(/\\x/g, '%'))
  } catch (err) {
    return text
  }
}

function getLsofNameMap(results) {
  var ret = {}
  results.forEach(function(item) {
    ret[item.name] = item
  })
  return ret
}

function mapLimit(arr, fn, limit) {
  limit = limit || Infinity
  return new Promise(function(resolve, reject) {
    var ret = []
    var startCount = 0; var execCount = 0; var doneCount = 0
    var hasDone, hasStart

    function exec() {
      for (let i = startCount; i < arr.length; i++) {
        if (execCount >= limit) return
        hasStart = true
        execCount++
        startCount++
        fn(arr[i], i).then(function(val) {
          if (hasDone) { return }
          execCount--
          doneCount++
          ret[i] = val
          if (doneCount === arr.length) {
            hasDone = true
            resolve(ret)
          } else {
            exec()
          }
        }).catch(function(err) {
          hasDone = true
          return reject(err)
        })
      }
    }

    if (arr && arr.length) {
      exec()
    }

    if (!hasStart) resolve(null) // empty
  })
}

exports.detectFiles = detectFiles
exports.detectFile = detectFile
exports.parseLsofRaw = parseLsofRaw
exports.fastLsofBinary = fastLsofBinary
exports.lsof = lsof
