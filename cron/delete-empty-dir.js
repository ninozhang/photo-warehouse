var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),

    log = require('../components/log/log'),

    conf = require('../conf');

module.exports = function () {
    var dirs = findDir(conf.path.input);
    _.each(dirs, function (dir) {
        fs.rmdir(dir, function () {

        });
    });
};

function findDir(p, paths) {
    try {
        var stats = fs.statSync(p);

        if (!paths) {
            paths = [];
        } else {
            paths.push(p);
        }

        if (stats.isDirectory()) {
            var files = fs.readdirSync(p);
            files.forEach(function (file) {
                findDir(path.resolve(p, file), paths);
            });
        }

        return paths;
    } catch(e) {
        log.error('Error', p, e);
    }
}