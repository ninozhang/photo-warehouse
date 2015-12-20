var fs = require('fs'),
    path = require('path'),
    cluster = require('cluster'),
    os = require('os'),

    commander = require('commander'),
    _ = require('underscore'),
    async = require('async'),
    chokidar = require('chokidar'),
    md5File = require('md5-file'),
    sizeOf = require('image-size'),

    conf = require('./conf'),
    mysql = require('./components/mysql/mysql'),
    photo = require('./components/photo/photo'),
    exif = require('./components/exif/exif'),


    IPHONE_RATIO = 1.775,
    IPAD_RATIO = 0.75,

    INPUT_DIR = 'D:\\photo\\input',
    OUTPUT_DIR = 'D:\\photo\\output',

    DEV = 'development',
    TEST = 'test',
    PROD = 'production',

    modes = {
        development: ['development', 'dev'],
        test: ['test'],
        production: ['production', 'prod']
    },

    pidFile,
    mode,
    port,
    
    fileWatcher;

function detectMode(m) {
    if (!m) {
        return;
    }
    
    var _m = m.toLowerCase();
    for (var key in modes) {
        if (modes[key].indexOf(_m) > -1) {
            return key;
        }
    }
    return DEV;
}


function extract(file, callback) {
    async.series([
        // 计算文件 MD5
        function (callback) {
            md5File(file, function (err, md5) {
                callback(err, {
                    id: md5,
                    md5: md5
                });
            });
        },
        // 获取文件信息
        function (callback) {
            var stat = fs.statSync(file);
            callback(null, {
                size: stat.size,
                time: new Date(stat.mtime).getTime()
            });
        },
        // 获取图片高宽
        function (callback) {
            console.log(sizeOf(file));
            callback(null, sizeOf(file));
        },
        // 获取照片的 EXIF
        function (callback) {
            exif(file, callback);
        }
    ], function (err, results) {
        console.log('error', err);
        var data = _.extend({},
                results[0],
                results[1],
                results[2],
                results[3]);
        photo.save(data, function (err, results) {
            console.log('PHOTO_SAVE', err, results);
        });
    });
}

function checkAndMakeFolder(dir) {
    var stat = fs.statSync(dir);
    console.log(dir);
}

function move(src, dest) {
    fs.rename(src, dest, function (err) {
        if (err) {
            console.log('error', err);
            throw err;
        }
        console.log('renamed complete');
    });
}

function read(filename) {
    console.log('filename', filename);
    var file = path.resolve(INPUT_DIR, filename);
    console.log('file', file);
    console.log('stat', extract(file));
    
}

function watch() {
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
    });

    fileWatcher.on('change', function(path, stats) {
    });

    fileWatcher.add(INPUT_DIR);
}

function start() {
    read('IMG_0117.JPG');
    read('IMG_0883.PNG');
}

if (require.main === module) {
    // 配置命令行参数
    commander.option('-p, --port <number>', 'server port')
        .option('-P, --pidfile <path>', 'path of pidfile')
        .option('-m, --mode <dev|prod>', 'mode')
        .parse(process.argv);

    console.info('detecting environment ..');

    console.info('commander.port', commander.port);
    console.info('process.env.PORT', process.env.PORT);
    console.info('commander.pidfile', commander.pidfile);
    console.info('commander.mode', commander.mode);

    console.info('configuring ..');

    // 从命令行参数中读取，如果没有就默认设置为开发环境
    if (commander.mode) {
        mode = detectMode(commander.mode);
    }
    // 默认为开发模式
    if (!mode) {
        mode = DEV;
    }
    console.info('mode', mode);

    // 初始化配置，并且传进模式
    conf.init({
        mode: mode
    });

    // 端口取用优先级
    // 从启动参数中获取
    if (commander.port) {
        try {
            port = Number(commander.port);
        } catch(e) {
            console.warn('commander.port parse error', e);
        }
    }
    // 从环境变量中获取
    if (!port && process.env.PORT) {
        try {
            port = Number(process.env.PORT);
        } catch(e) {
            console.warn('process.env.PORT parse error', e);
        }
    }
    // 从配置文件获取
    if (!port && conf.server.port) {
        port = conf.server.port;
    }
    // 默认 7000
    if (!port) {
        port = 7000;
    }
    console.info('server port', port);

    // pidFile
    pidFile = commander.pidfile;

    // 将参数放到配置中
    conf.mode = mode;
    conf.server.port = port;

    // 初始化数据库
    mysql.init();

    // 启动小蜜蜂
    start();
}