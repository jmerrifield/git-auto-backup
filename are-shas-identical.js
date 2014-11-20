var exec = require('child_process').exec

module.exports = function lastAutoTag(sha1, sha2, dir, callback) {
  exec('git diff ' + sha1 + ' ' + sha2, {cwd: dir}, function (err, stdout, stderr) {
    if (err) return callback(err)
    callback(null, !stdout.trim())
  })
}

if (!module.parent) {
  module.exports(process.argv[2], process.argv[3], process.argv[4], function (err, result) {
    console.log('DONE', err, '"' + result + '"')
  })
}
