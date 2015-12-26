var _ = require('underscore'),
  
  mysql = require('../mysql/mysql');

function findById(id, callback) {
  var sql = 'SELECT * FROM photo WHERE isDel = 0 AND id = ?';

  mysql.query(sql, [id], callback);
}
exports.findById = findById;

function find(data, callback) {
  var sql = 'SELECT * FROM photo WHERE isDel = 0',
    values = [];

  _.each(data, function (value, key) {
    sql += ' AND ' + key + ' = ?';
    values.push(value);
  });

  mysql.query(sql, values, callback);
}
exports.find = find;

function save(data, callback) {
  var sql = 'INSERT INTO photo SET ?';

  mysql.query(sql, data, callback);
}
exports.save = save;

function update(id, data, callback) {
  var sql = 'UPDATE photo set ? WHERE id = ?';

  mysql.query(sql, [data, id], callback);
}
exports.update = update;

function del() {

}
exports.del = del;