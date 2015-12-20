var fs = require('fs'),
    path = require('path'),
    cluster = require('cluster'),
    os = require('os'),

    commander = require('commander'),
    _ = require('underscore'),
    async = require('async'),
    ExifImage = require('exif').ExifImage,
    chokidar = require('chokidar'),
    md5File = require('md5-file'),
    sizeOf = require('image-size'),

    conf = require('./conf'),
    photo = require('./components/photo/photo'),

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

function exif(file, callback) {
    try {
        new ExifImage({
            image: file
        }, function (err, exif) {
            if (err) {
                callback(err);
            } else {
                callback(null, {
                    Make: exif.image.Make,  // 照相机制造商
                    Model: exif.image.Model,  // 照相机型号
                    Orientation: exif.image.Orientation,  // 旋转
                    XResolution: exif.image.XResolution,  // 水平分辨率
                    YResolution: exif.image.YResolution,  // 垂直分辨率
                    ResolutionUnit: exif.image.ResolutionUnit,  // 分辨率单位
                    Software: exif.image.Software,  // 程序名称
                    ModifyDate: exif.image.ModifyDate,  // 修改日期
                    YCbCrPositioning: exif.image.YCbCrPositioning,
                    ExifOffset: exif.image.ExifOffset,
                    GPSInfo: exif.image.GPSInfo,
                    ExposureTime: exif.exif.ExposureTime,  // 曝光时间
                    FNumber: exif.exif.FNumber,  // 光圈值
                    ExposureProgram: exif.exif.ExposureProgram,  // 曝光程序
                    ISO: exif.exif.ISO,  // ISO
                    DateTimeOriginal: exif.exif.DateTimeOriginal,  // 原始时间
                    CreateDate: exif.exif.CreateDate,  // 拍摄日期
                    ShutterSpeedValue: exif.exif.ShutterSpeedValue,  // 快门速度
                    BrightnessValue: exif.exif.BrightnessValue,  // 亮度
                    ExposureCompensation: exif.exif.ExposureCompensation,  // 曝光补偿
                    MeteringMode: exif.exif.MeteringMode,  // 测光模式
                    Flash: exif.exif.Flash,  // 闪光灯
                    FocalLength: exif.exif.FocalLength,  // 焦距
                    ExifImageWidth: exif.exif.ExifImageWidth,  // 宽度
                    ExifImageHeight: exif.exif.ExifImageHeight,  // 高度
                    ExposureMode: exif.exif.ExposureMode,  // 曝光模式
                    WhiteBalance: exif.exif.WhiteBalance,  // 白平衡
                    FocalLengthIn35mmFormat: exif.exif.FocalLengthIn35mmFormat,  // 35 mm 焦距
                    LensMake: exif.exif.LensMake,  // 镜头制造商
                    LensModel: exif.exif.LensModel,  // 镜头型号
                    GPSLatitudeRef: exif.gps.GPSLatitudeRef,  // GPS纬度参考
                    GPSLatitude: exif.gps.GPSLatitude.join(','),  // GPS纬度
                    GPSLongitudeRef: exif.gps.GPSLongitudeRef,  // GPS经度参考
                    GPSLongitude: exif.gps.GPSLongitude.join(','),  // GPS经度
                    GPSAltitudeRef: exif.gps.GPSAltitudeRef,  // GPS高度参考
                    GPSAltitude: exif.gps.GPSAltitude,  // GPS高度
                    GPSTimeStamp: exif.gps.GPSTimeStamp.join(','),  // GPS时间戳
                    GPSSpeedRef: exif.gps.GPSSpeedRef,  // GPS速度参考
                    GPSSpeed: exif.gps.GPSSpeed,  // GPS速度
                    GPSImgDirectionRef: exif.gps.GPSImgDirectionRef,  // GPS方向参考
                    GPSImgDirection: exif.gps.GPSImgDirection,  // GPS方向
                    GPSDestBearingRef: exif.gps.GPSDestBearingRef,  // GPS轴向参考
                    GPSDestBearing: exif.gps.GPSDestBearing,  // GPS轴向
                    GPSDateStamp: exif.gps.GPSDateStamp,  // GPS日期戳
                });
            }
            callback(err);
        });
    } catch (err) {
        console.log('Error: ' + err.message);
    }
}

function extract(file, callback) {
    async.series([
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

    // 启动小蜜蜂
    start();
}