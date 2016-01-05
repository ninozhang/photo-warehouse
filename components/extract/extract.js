var fs = require('fs'),
  path = require('path'),

  _ = require('underscore'),
  async = require('async'),
  md5File = require('md5-file'),
  sizeOf = require('image-size'),

  log = require('../log/log'),
  exif = require('../exif/exif');

function extract(file, callback) {
  var filePath = path.parse(file),
    ext = filePath.ext.toLowerCase();

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
      var stat = fs.statSync(file),
        time = new Date(stat.mtime || stat.atime);
      callback(null, {
        size: stat.size,
        time: time.getTime()
      });
    },
    // 获取图片高宽
    function (callback) {
      if (ext === '.jpg'
        || ext === '.jpeg'
        || ext === '.bmp'
        || ext === '.png'
        || ext === '.gif') {
        try {
          callback(null, sizeOf(file));
        } catch(err) {
          callback(null, {
            type: ext.substring(1)
          });
        }
      } else {
        callback(null, {
          type: ext.substring(1)
        });
      }
    },
    // 获取照片的 EXIF
    function (callback) {
      if (ext === '.jpg' || ext === '.jpeg') {
        exif(file, callback);
      } else {
        callback(null, null);
      }
    }
  ], function (err, results) {
    if (err) {
      log.error('PHOTO_EXTRACT', file, err);
    }

    var data = _.extend({},
        results[0],
        results[1],
        results[2],
        results[3]);

    if (!data.width &&
        data.ExifImageWidth) {
      data.width = data.ExifImageWidth;
    }

    if (!data.height &&
        data.ExifImageHeight) {
      data.height = data.ExifImageHeight;
    }

    var time = data.DateTimeOriginal || data.CreateDate || data.time,
      date = new Date(time);
    
    _.extend(data, {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
      day: date.getDay(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    });

    if (callback) {
      callback(null, data);
    }
  });
}
module.exports = extract;