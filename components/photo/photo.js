var _ = require('underscore'),
    
    mysql = require('../mysql/mysql');

function save(data, callback) {
    var sql = 'INSERT INTO photo SET ?';;

    mysql.query(sql, data, callback);
}
exports.save = save;