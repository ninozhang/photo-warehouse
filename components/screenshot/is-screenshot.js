var _ = require('underscore'),

  wh = [
    // 缩略图
    {
      width: 160,
      height: 320
    },
    // nexus4
    {
      width: 800,
      height: 1280
    },
    // iPhone 3gs
    {
      width: 320,
      height: 480
    },
    // iPhone 4
    {
      width: 640,
      height: 960
    },
    // iPhone 5
    {
      width: 640,
      height: 1136
    },
    // iPhone 6
    {
      width: 750,
      height: 1334
    },
    // iPhone 6 plus
    {
      width: 1080,
      height: 1920
    },
    // iPhone 6s
    {
      width: 1125,
      height: 2000
    },
    // iPhone 6s plus
    {
      width: 1242,
      height: 2208
    },
    // iPad 1 2 mini
    {
      width: 1024,
      height: 768
    },
    // iPad 3 4 air mini2
    {
      width: 2048,
      height: 1536
    }
  ];

module.exports = function (values) {
  var type = values.type,
    width = values.width,
    height = values.height;

  if (type && type.toLowerCase() === 'png') {
    return true;
  }

  if (width && height) {
    var match = false;
    _.each(wh, function (o) {
      if (width === o.width
        && height === o.height) {
        match = true;
      }
    });
    return match;
  }

  return false;
}