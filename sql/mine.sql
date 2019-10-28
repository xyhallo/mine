/*
 Navicat Premium Data Transfer

 Source Server         : 本地
 Source Server Type    : MySQL
 Source Server Version : 50726
 Source Host           : localhost:3306
 Source Schema         : mine

 Target Server Type    : MySQL
 Target Server Version : 50726
 File Encoding         : 65001

 Date: 20/10/2019 22:51:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for scene
-- ----------------------------
DROP TABLE IF EXISTS `scene`;
CREATE TABLE `scene`  (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `UserId` int(11) NULL DEFAULT NULL COMMENT '用户ID',
  `Scene` int(11) NULL DEFAULT 0 COMMENT '总场次',
  `WinScene` int(11) NULL DEFAULT 0 COMMENT '赢的场次',
  `FailScene` int(11) NULL DEFAULT 0 COMMENT '输的场次',
  `LevelOne` int(11) NULL DEFAULT 0 COMMENT '初级场次',
  `LevelTwo` int(11) NULL DEFAULT 0 COMMENT '中级场次',
  `LevelThree` int(11) NULL DEFAULT 0 COMMENT '高级场次',
  `LevelOneWin` int(11) NULL DEFAULT 0 COMMENT '赢的初级场次\r\n',
  `LevelTwoWin` int(11) NULL DEFAULT 0 COMMENT '赢的中级场次\r\n',
  `LevelThreeWin` int(11) UNSIGNED NULL DEFAULT 0 COMMENT '赢的高级场次\r\n',
  `MaxTimeOne` int(11) NULL DEFAULT 0 COMMENT '初级最快时间',
  `MaxTimeTwo` int(11) NULL DEFAULT 0 COMMENT '中级最快时间',
  `MaxTimeThree` int(11) NULL DEFAULT 0 COMMENT '高级最快时间',
  PRIMARY KEY (`Id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `UserName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '账号',
  `Password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '密码',
  `NickName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `Email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `Phone` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '电话',
  `Gender` int(11) NULL DEFAULT 0 COMMENT '性别',
  `CreateTime` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `LastIp` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '最后一次登录IP',
  PRIMARY KEY (`Id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
