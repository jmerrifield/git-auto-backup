var csp = require('js-csp')
var map = require('transducers.js').map


var ch = csp.chan(1, map(function (x) {
  return 'MAPPED: ' + x
}))

csp.go(function* () {

  while(true) {
    console.log('TOOK', yield csp.take(ch))
  }
})

setInterval(function () {
  csp.putAsync(ch, (+new Date()))
}, 500)
