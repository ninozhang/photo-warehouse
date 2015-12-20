var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),

    conf = require('./conf'),

    cronDir = './cron',
    cronInterval,

    log,

    cronFiles = [],
    crons = [];


// 查找定时任务
function fetchCron(p) {
    var _p = path.resolve(__dirname, p),
        stats = fs.statSync(_p);

    if (stats.isFile()) {
        cronFiles.push(p.replace('.js', ''));
    } else {
        var files = fs.readdirSync(_p);
        files.forEach(function (file) {
            fetchCron(p + '/' + file);
        });
    }
}

// 执行定时任务
function exec() {
    crons.forEach(function (cron) {
        cron();
    });
}

// 初始化定时任务
function init() {
    log = conf.log;
    cronInterval = conf.cron.interval;

    log.info('init CRON, interval', cronInterval);

    // 查找定时任务
    fetchCron(cronDir);

    // 读取定时任务
    cronFiles.forEach(function (path) {
        var cronMod = require(path);
        if (_.isFunction(cronMod)) {
            crons.push(cronMod);
        }
    });

    // 先执行一次，初始化系统，保证后面的流程要用到的数据
    exec();

    // 设置定期执行
    setInterval(exec, cronInterval);
}

module.exports = init;