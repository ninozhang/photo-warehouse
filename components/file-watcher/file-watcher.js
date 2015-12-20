var  _ = require('underscore'),
    chokidar = require('chokidar'),
    
    fileWatcher;

function watch(dir, callback) {
    fileWatcher = chokidar.watch('file, dir', {
        persistent: true,

        ignored: '*.txt',
        ignoreInitial: false,
        followSymlinks: true,
        cwd: '.',

        usePolling: true,
        interval: 100,
        binaryInterval: 300,
        alwaysStat: false,
        depth: 99,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        },

        ignorePermissionErrors: false,
        atomic: true
    });

    fileWatcher.on('add', function(path, stats) {
        callback(path, stats);
    });

    fileWatcher.add(dir);
}
exports.watch = watch;