var fs = require('fs'),
  path = require('path'),

  _ = require('underscore'),

  log = require('../components/log/log'),
  photo = require('../components/photo/photo'),
  screenshot = require('../components/screenshot/screenshot'),
  isScreenshot = require('../components/screenshot/is-screenshot'),
  queue = require('../components/queue/queue'),
  extract = require('../components/extract/extract'),
  store = require('../components/store/store'),

  conf = require('../conf');

module.exports = function () {
  // 获取队列
  var file = queue.pop();

  if (!file) {
    log.debug('木有新的文件了');
    return;
  }

  // 剔除无效文件
  if (file.indexOf('.') === 0 ||
    file.indexOf('.db') > -1 ||
    file.indexOf('.ini') > -1 ||
    file.indexOf('.THM') > -1 ||
    file.indexOf('.DS_Store') > -1) {
    log.warn('无效文件', file, '删除');
    store.del(file);
    return;
  }

  log.info('开始处理文件', file);

  // 提取文件信息
  extract(file, function (err, data) {
    // 生成保存路径
    try {
      var filename = [data.year, data.month, data.date, data.hour, data.minute, data.second, data.md5.substring(0, 4) + '.' + data.type].join('_');
      data.path = [data.year, data.month, data.date, filename].join('/');
    } catch(err) {
      var pathParse = path.parse(file),
        newFile = path.resolve(conf.path.error, pathParse.base);
      store.move(file, newFile, function (err) {
        log.error('FILE_MOVE_TO_ERROR', newFile, err);
      });
      return;
    }

    if (err) {
      log.error('提取文件信息出错，退出', file);
      // 将文件移动到出错目录
      var newFile = path.resolve(conf.path.error, data.path);
      store.move(file, newFile, function (err) {
        log.error('FILE_MOVE_TO_ERROR', newFile, err);
      });
      return;
    }

    // 是屏幕截图
    if (isScreenshot(data)) {
      // 保存或更新数据库
      var fullData = data;
      data = {};
      _.each([
        'id',
        'md5',
        'path',
        'size',
        'time',
        'year',
        'month',
        'date',
        'day',
        'hour',
        'minute',
        'second',
        'type',
        'width',
        'height'
      ], function (name) {
        data[name] = fullData[name];
      });
      screenshot.findById(data.id, function (err, results) {
        if (results.length === 0) {
          log.info('截图' + data.id + '不存在，保存信息并移动文件');
          screenshot.save(data, function (err, results) {
            log.info('SCREENSHOT_SAVED', file, err);
          });

          // 截图不存在，移动文件到目录下
          var newFile = path.resolve(conf.path.screenshot, data.path);
          store.move(file, newFile, function (err) {
            log.info('SCREENSHOT_MOVE_TO', newFile, err);
          });
        } else {
          log.info('截图' + data.id + '已存在，更新信息并删除文件');
          screenshot.update(data.id, data, function (err, results) {
            log.info('SCREENSHOT_UPDATED', file, err);
          });

          // 截图已存在，直接删除文件
          store.del(file);
        }
      });

    // 不是屏幕截图
    } else {
      // 保存或更新数据库
      photo.findById(data.id, function (err, results) {
        if (results.length === 0) {
          log.info('照片' + data.id + '不存在，保存信息并移动文件');
          photo.save(data, function (err, results) {
            log.info('PHOTO_SAVED', file, err);
          });

          // 照片不存在，移动文件到目录下
          var newFile = path.resolve(conf.path.photo, data.path);
          store.move(file, newFile, function (err) {
            log.info('PHOTO_MOVE_TO', newFile, err);
          });
        } else {
          log.info('照片' + data.id + '已存在，更新信息并删除文件');
          photo.update(data.id, data, function (err, results) {
            log.info('PHOTO_UPDATED', file, err);
          });

          // 照片已存在，直接删除文件
          store.del(file);
        }
      });
    }
  });
};