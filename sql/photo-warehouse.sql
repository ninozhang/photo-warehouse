# Host: 127.0.0.1  (Version: 5.7.9-log)
# Date: 2015-12-20 01:02:07
# Generator: MySQL-Front 5.3  (Build 4.234)

/*!40101 SET NAMES utf8 */;

#
# Structure for table "photo"
#

CREATE TABLE `photo` (
  `id` char(32) NOT NULL DEFAULT '',
  `md5` varchar(32) DEFAULT NULL COMMENT '文件MD5戳',
  `size` int(11) DEFAULT NULL COMMENT '文件大小',
  `time` bigint(20) NOT NULL DEFAULT '0' COMMENT '修改时间',
  `type` varchar(36) DEFAULT NULL COMMENT '文件类型',
  `width` mediumint(9) NOT NULL DEFAULT '0' COMMENT '宽',
  `height` mediumint(9) NOT NULL DEFAULT '0' COMMENT '高',
  `Make` varchar(255) DEFAULT NULL COMMENT '照相机制造商',
  `Model` varchar(255) DEFAULT NULL COMMENT '照相机型号',
  `Orientation` tinyint(3) DEFAULT NULL COMMENT '旋转',
  `XResolution` tinyint(3) DEFAULT NULL COMMENT '水平分辨率',
  `YResolution` tinyint(3) DEFAULT NULL COMMENT '垂直分辨率',
  `ResolutionUnit` tinyint(3) DEFAULT NULL COMMENT '分辨率单位',
  `Software` varchar(255) DEFAULT NULL COMMENT '程序名称',
  `ModifyDate` varchar(255) DEFAULT NULL COMMENT '修改日期',
  `YCbCrPositioning` smallint(6) DEFAULT NULL,
  `ExifOffset` smallint(6) DEFAULT NULL,
  `GPSInfo` smallint(6) DEFAULT NULL,
  `ExposureTime` double(12,6) DEFAULT NULL COMMENT '曝光时间',
  `FNumber` double(3,1) DEFAULT NULL COMMENT '光圈值',
  `ExposureProgram` tinyint(3) DEFAULT NULL COMMENT '曝光程序',
  `ISO` smallint(6) DEFAULT NULL COMMENT 'ISO',
  `DateTimeOriginal` varchar(255) DEFAULT NULL COMMENT '原始时间',
  `CreateDate` varchar(255) DEFAULT NULL COMMENT '拍摄日期',
  `ShutterSpeedValue` double(12,6) DEFAULT NULL COMMENT '快门速度',
  `BrightnessValue` double(8,6) DEFAULT NULL COMMENT '亮度',
  `ExposureCompensation` smallint(6) DEFAULT NULL COMMENT '曝光补偿',
  `MeteringMode` tinyint(3) DEFAULT NULL COMMENT '测光模式',
  `Flash` smallint(6) DEFAULT NULL COMMENT '闪光灯',
  `FocalLength` double(6,2) DEFAULT NULL COMMENT '焦距',
  `ExifImageWidth` int(11) DEFAULT NULL COMMENT '宽度',
  `ExifImageHeight` int(11) DEFAULT NULL COMMENT '高度',
  `ExposureMode` tinyint(3) DEFAULT NULL COMMENT '曝光模式',
  `WhiteBalance` varchar(255) DEFAULT NULL COMMENT '白平衡',
  `FocalLengthIn35mmFormat` smallint(6) DEFAULT NULL COMMENT '35 mm 焦距',
  `LensMake` varchar(255) DEFAULT NULL COMMENT '镜头制造商',
  `LensModel` varchar(255) DEFAULT NULL COMMENT '镜头型号',
  `GPSLatitudeRef` varchar(255) DEFAULT NULL COMMENT 'GPS纬度参考',
  `GPSLatitude` varchar(255) DEFAULT NULL COMMENT 'GPS纬度',
  `GPSLongitudeRef` varchar(255) DEFAULT NULL COMMENT 'GPS经度参考',
  `GPSLongitude` varchar(255) DEFAULT NULL COMMENT 'GPS经度',
  `GPSAltitudeRef` varchar(255) DEFAULT NULL COMMENT 'GPS高度参考',
  `GPSAltitude` double(8,2) DEFAULT NULL COMMENT 'GPS高度',
  `GPSTimeStamp` varchar(255) DEFAULT NULL COMMENT 'GPS时间戳',
  `GPSSpeedRef` varchar(255) DEFAULT NULL COMMENT 'GPS速度参考',
  `GPSSpeed` double(6,2) DEFAULT NULL COMMENT 'GPS速度',
  `GPSImgDirectionRef` varchar(255) DEFAULT NULL COMMENT 'GPS方向参考',
  `GPSImgDirection` varchar(255) DEFAULT NULL COMMENT 'GPS方向',
  `GPSDestBearingRef` varchar(255) DEFAULT NULL COMMENT 'GPS轴向参考',
  `GPSDestBearing` varchar(255) DEFAULT NULL COMMENT 'GPS轴向',
  `GPSDateStamp` varchar(255) DEFAULT NULL COMMENT 'GPS日期戳',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
