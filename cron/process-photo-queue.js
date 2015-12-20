var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),

    log = require('../components/log/log'),
    photo = require('../components/photo/photo'),
    photoQueue = require('../components/photo-queue/photo-queue'),
    extract = require('../components/photo-extract/photo-extract'),
    photoStore = require('../components/photo-store/photo-store'),

    conf = require('../conf');

module.exports = function () {
    // 获取队列
    var file = photoQueue.pop();

    if (!file) {
        log.debug('木有新的文件了');
        return;
    }

    // 剔除无效文件
    if (file.indexOf('.db') > -1 ||
        file.indexOf('.ini') > -1 ||
        file.indexOf('.DS_Store') > -1) {
        log.warn('无效文件', file, '删除');
        photoStore.del(file);
        return;
    }

    // 提取文件信息
    extract(file, function (err, data) {
        // 生成保存路径
        var filename = [data.year, data.month, data.date, data.hour, data.minute, data.second, data.md5.substring(0, 4) + '.' + data.type].join('_');
        data.path = [data.year, data.month, data.date, filename].join('/');

        if (err) {
            log.error('提取文件信息出错，退出', file);
            // 将文件移动到出错目录
            var newFile = path.resolve(conf.path.error, data.path);
            photoStore.move(file, newFile, function (err) {
                log.error('PHOTO_MOVE_TO_ERROR', newFile, err);
            });
            return;
        }

        // TODO 是否屏幕截图

        // 保存或更新数据库
        photo.findById(data.id, function (err, results) {
            if (results.length === 0) {
                log.info('照片' + data.id + '不存在，保存信息并移动文件');
                photo.save(data, function (err, results) {
                    log.info('PHOTO_SAVED', file, err, results);
                });

                // 照片不存在，移动文件到目录下
                var newFile = path.resolve(conf.path.output, data.path);
                photoStore.move(file, newFile, function (err) {
                    log.info('PHOTO_MOVE_TO', newFile, err);
                });
            } else {
                log.info('照片' + data.id + '已存在，更新信息并删除文件');
                photo.update(data.id, data, function (err, results) {
                    log.info('PHOTO_UPDATED', file, err, results);
                });

                // 照片已存在，直接删除文件
                photoStore.del(file);
            }
        })
    });
};