# is-file-opened

Detect file opened in windows and mac, based on [opened](https://github.com/ronomon/opened) and [lsof-mac-fast](https://github.com/zuzkins/lsof-mac-fast)

## Installation

```sh
$ npm install is-file-opened --save
```

## Api

```js
detectFile(file)

detectFiles(files)

parseLsofRaw(lsofStr)
```

## Usage

```js
const path = require('path')
const isFileOpened = require('is-file-opened')

const file = path.join(__dirname, 'some.file')

isFileOpened.detectFile(file).then(function(opened) {
  console.log('opened', opened) // true or false
}).catch(err => {
  console.log('crash', err)
})

isFileOpened.detectFiles([file]).then(function(openedMap) {
  console.log('openedMap', openedMap) // { 'some.file': Boolean }
}).catch(err => {
  console.log('crash', err)
})
```

## License

MIT
