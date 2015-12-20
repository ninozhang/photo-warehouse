var fs = require('fs'),
    path = require('path');

function checkAndMakeDir(dir) {
    var dirParts = dir.indexOf('/') > -1 ? dir.split(/\//) : dir.split(/\\/),
        dir = dirParts.shift(),
        part,
        stat;
    while (part = dirParts.shift()) {
        dir += '/' + part;
        try {
            stat = fs.statSync(dir);
            if (stat.isDirectory()) {

            }
        } catch (err) {
            fs.mkdirSync(dir);
        }
    }
}

function del(file, callback) {
    fs.unlink(file, callback);
}
exports.del = del;

function move(src, dest, callback) {
    var destPath = path.parse(dest);
    checkAndMakeDir(destPath.dir);
    fs.rename(src, dest, callback);
}
exports.move = move;