var log4js = require('log4js'),

  conf = require('../../conf'),

  isInit = false,

  mode,
  level,

  log,
  maxSize,
  backups,

  appenders,

  debugLog,
  infoLog,
  warnLog,
  errorLog;

function init() {
  mode = conf.mode;
  level = 'INFO';

  log = conf.log;

  if (log) {
    maxSize = log.maxSize;
    backups = log.backups;
  }

  appenders = [
    {
      type: 'file',
      category: 'debug',
      filename: 'private/log/debug.log',
      maxLogSize: maxSize || 1024000000,
      backups: backups || 10
    },
    {   type: 'file',
      category: 'info',
      filename: "private/log/info.log", // specify the path where u want logs folder error.log
      maxLogSize: maxSize || 1024000000,
      backups: backups || 10
    },
    {   type: 'file',
      category: 'warn',
      filename: "private/log/warn.log", // specify the path where u want logs folder error.log
      maxLogSize: maxSize || 1024000000,
      backups: backups || 10
    },
    {   type: 'file',
      category: 'error',
      filename: "private/log/error.log", // specify the path where u want logs folder error.log
      maxLogSize: maxSize || 1024000000,
      backups: backups || 10
    }
  ];

  // 开发环境下采用开发配置
  if (mode !== 'production') {
    appenders.push({
      type: 'console'
    });

    level = 'DEBUG';
  }

  // 配置 log4js
  log4js.configure({
    appenders: appenders,
    replaceConsole: true
  });

  // 配置单个日志
  debugLog = log4js.getLogger('debug');
  infoLog = log4js.getLogger('info');
  warnLog = log4js.getLogger('warn');
  errorLog = log4js.getLogger('error');

  debugLog.setLevel(level);
  infoLog.setLevel(level);
  warnLog.setLevel(level);
  errorLog.setLevel(level);

  isInit = true;

  debug('log init debug')
  info('log init info') 
  warn('log init warn') 
  error('log init error')
}

function debug() {
  var args = Array.prototype.slice.apply(arguments);
  
  if (!isInit) {
    init();
  }

  debugLog.debug.apply(debugLog, args);
}
exports.debug = debug;

function info() {
  var args = Array.prototype.slice.apply(arguments);

  if (!isInit) {
    init();
  }

  infoLog.info.apply(infoLog, args);
}
exports.info = info;

function warn() {
  var args = Array.prototype.slice.apply(arguments);

  if (!isInit) {
    init();
  }

  warnLog.warn.apply(warnLog, args);
}
exports.warn = warn;

function error() {
  var args = Array.prototype.slice.apply(arguments);

  if (!isInit) {
    init();
  }

  errorLog.error.apply(errorLog, args);
}
exports.error = error;

