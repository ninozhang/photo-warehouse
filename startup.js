var path = require('path'),
    fs = require('fs'),

    _ = require('underscore'),
    async = require('async'),
    ExifImage = require('exif').ExifImage,
    chokidar = require('chokidar'),
    mysql = require('mysql'),
    md5File = require('md5-file'),
    sizeOf = require('image-size'),

    IPHONE_RATIO = 1.775,
    IPAD_RATIO = 0.75,

    INPUT_DIR = 'D:\\photo\\input',
    OUTPUT_DIR = 'D:\\photo\\output',
    
    fileWatcher;

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
                results[3]),
            sql = 'INSERT INTO photo SET ?',
            connection = mysql.createConnection({
                host: '127.0.0.1',
                port: 3306,
                user: 'root',
                password: 'nino1234',
                database: 'photo-warehouse'
            }),
            query;

        query = connection.query(sql, data, function(err, result) {
            console.log('sql', err, result);
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

function process(filename) {
    console.log('filename', filename);
    var file = path.resolve(INPUT_DIR, filename);
    console.log('file', file);
    console.log('stat', extract(file));
    
}

process('IMG_0117.JPG');
process('IMG_0883.PNG');

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