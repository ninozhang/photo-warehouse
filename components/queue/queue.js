var _ = require('underscore'),

  queue = [];

function pop() {
  return queue.pop();
}
exports.pop = pop;

function push(file) {
  queue.push(file);
}
exports.push = push;