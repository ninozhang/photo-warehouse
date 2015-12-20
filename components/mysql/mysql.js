var _ = require('underscore'),
    mysql = require('mysql'),

    conf = require('../../conf'),
    
    pool;
    
function init(callback) {
    var dbConf = conf.mysql;

    pool = mysql.createPool({
        connectionLimit: 20,
        host: dbConf.host,
        port: dbConf.port,
        database: dbConf.database,
        user: dbConf.user,
        password: dbConf.password
    });

    exports.pool = pool;

    log.info('[database init]', dbConf.host, dbConf.port, dbConf.database);
    
    callback(null, pool);
}

function query(sql, data, callback) {
    if (pool) {
        pool.query(sql, data, function (err, results) {
            if (err) {
                log.error('MYSQL_ERROR', err);
            }
            if (callback) {
                callback(err, results);
            }
        });
    } else {
        if (callback) {
            callback('EMPTY_MYSQL_POOL');
        }
    }
}

exports.init = init;
exports.query = query;
exports.escape = mysql.escape;