var exec = require('child_process').exec
var async = require('async')
var csp = require('js-csp')
var map = require('transducers.js').map

var repos = [
  '/Volumes/zfsdev/fe'
]


function createStash(dir) {
  return doCommand('git stash create', {cwd: dir})
}

function getLastTag(dir) {
  return doCommand('git tag -l auto* | sort -r | tail -1', {cwd: dir})
}

function areIdentical(tree1, tree2, dir) {
  var ch = csp.chan(1, function (result) {
    return !result
  })

  return doCommand('git diff ' + tree1 + ' ' + tree2, {cwd: dir}, ch)
}

function createTag(name, sha, dir, callback) {
  exec('git tag ' + name + ' ' + sha, {cwd: dir}, function (err, stdout, stderr) {
    if (err) return callback(err)
    callback(null)
  })
}

function doCommand(cmd, opts, chan) {
  var ch = chan || csp.chan()

  exec(cmd, opts, function (err, stdout) {
    if (err) csp.putAsync(ch, err)
    csp.putAsync(ch, stdout.trim())
  })

  return ch
}

csp.go(function* () {
  var sha = yield csp.take(createStash(repos[0]))
  if (!sha) {
    console.log('No differences from HEAD, bailing')
    return
  }

  var lastTag = yield csp.take(getLastTag(repos[0]))
  if (lastTag) {
    var identical = yield csp.take(areIdentical(lastTag, sha, repos[0]))
    if (identical) {
      console.log('No differences from last auto tag, bailing')
      return
    }
  }

  console.log('Creating tag from SHA')
})

function doTags() {
  console.log('Tagging')
  repos.forEach(function (repo) {
    exec('git stash create', {cwd: repo}, function (err, stdout, stderr) {
      if (err) throw err

      if(!stdout) {
        console.log('No changes')
        return
      }

      // DIFF WITH PREV HASH

      var name = 'auto-' + new Date().toISOString().replace(/:/g, '-')
      console.log('Creating tag', name, 'from SHA', stdout)
      exec('git tag ' + name + ' ' + stdout, {cwd: repo}, function (err, stdout, stderr) {
        if (err) throw err
        console.log('Tagged')
      })
    })
  })
}

// setInterval(doTags, 1 * 60 * 1000)
