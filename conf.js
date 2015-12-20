var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),

    DEV_FILENAME = 'config.dev.json',
    TEST_FILENAME = 'config.test.json',
    PROD_FILENAME = 'config.json';

function readJSON(filename) {
    var dir = __dirname + '/conf/',
        content,
        p;

    // 向上找 3 层目录
    for (var i = 0; i < 3; i++) {
        p = path.resolve(dir, filename);
        if (fs.existsSync(p)) {
            content = fs.readFileSync(p);
            break;
        }
        dir += '../';
    }

    // 解析 JSON
    return content ? JSON.parse(content) : null;
}

function init(options) {
    var pack = readJSON('package.json'),
        mode = (options && options.mode) || 'development',
        isUAE = (options && options.isUAE),
        prodConfig = readJSON(PROD_FILENAME),
        devConfig = readJSON(DEV_FILENAME),
        testConfig = readJSON(TEST_FILENAME),
        config;

    config = _.extend({}, prodConfig);

    // UAE环境则读取UAE的配置文件，并覆盖本地的 conf/config.json 不用本地的去覆盖
    if (!isUAE) {
        if (mode === 'development') {
            _.extend(config, devConfig);
        } else if (mode === 'test') {
            _.extend(config, testConfig);
        }   
    }

    if (pack.name) {
        config.name = pack.name;
    }
    if (pack.version) {
        config.version = pack.version;
    }

    for (var key in config) {
        exports[key] = config[key];
    }
}

exports.init = init;