define("js-git/mixins/path-to-entry.js", ["js-git/mixins/mem-cache.js","js-git/lib/modes.js"], function (module, exports) { var cache = require('js-git/mixins/mem-cache.js').cache;
var modes = require('js-git/lib/modes.js');

module.exports = function (repo) {
  repo.pathToEntry = pathToEntry;
};

function pathToEntry(rootTree, path, callback) {
  if (!callback) return pathToEntry.bind(this, path);
  var repo = this;
  var mode = modes.tree;
  var hash = rootTree;
  var parts = path.split("/").filter(Boolean);
  var index = 0;
  var cached;
  loop();
  function loop() {
    while (index < parts.length) {
      if (mode === modes.tree) {
        cached = cache[hash];
        if (!cached) return repo.loadAs("tree", hash, onLoad);
        var entry = cached[parts[index]];
        if (!entry) return callback();
        mode = entry.mode;
        hash = entry.hash;
        index++;
        continue;
      }
      return callback();
    }
    callback(null, {
      mode: mode,
      hash: hash
    });
  }

  function onLoad(err, value) {
    if (!value) return callback(err || new Error("Missing object: " + hash));
    cache[hash] = value;
    loop();
  }

}

});