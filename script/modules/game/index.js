/**
 * 模块 : 游戏模块
 */

// 数据库操作模块
const sequelize = require('../../mysql/db');
// 信息返回模块
const module_console = require('../console/index');
// 扫雷核心模块
const module_mine = require('../mine/index');

var event = {};

/**
 * 左键点击 <head:click>
 * 坐标x ---- x <必传>
 * 坐标y ---- y <必传>
 */
event.click = async (data, ws, callback) => {

    // 获取room
    var room = ws.status.room;

    if (room === null) return module_console.error('左键点击失败,没有找到房间', 'click', {}, callback);

    // 取出自己的player
    var player = room.player;

    var myself = player.filter(item => item.UserName === ws.status.user.UserName);

    if (myself.length !== 1) return module_console.error('左键点击失败,没有找到玩家', 'click', {}, callback);
    
    // 对局是否开始
    if (myself[0].Status === 0 || myself[0].Status === 1) return module_console.error('对局没有开始!', 'click', {}, callback);

    // 是否已失败/胜利
    if (myself[0].Status === 3 || myself[0].Status === 4) return module_console.error('你已经完成了对局!', 'click', {}, callback);

    // 点击坐标判断是否正确
    if (!(data.x >= 0 && data.x < room.Mode.Width && data.y >= 0 && data.y < room.Mode.Height)) {
        return module_console.error('左键点击失败,坐标不正确', 'click', {}, callback);
    }

    // 是否第一次点击
    if (!myself[0].isClick) {
        // 生成雷区 [点击区域x 点击区域y] [第一次必不可能是雷]

        myself[0].mineData.generateMineArea(data.x, data.y);
        myself[0].isClick = true;
        // myself.mineData = new module_mine(room.Mode, data.x, data.y, player, myself);
    }

    // 点击
    myself[0].mineData.click(data.x, data.y);
}

/**
 * 右键点击 <head:setMark>
 * 坐标x ---- x <必传>
 * 坐标y ---- y <必传>
 */
event.setMark = async (data, ws, callback) => {

    // 获取room
    var room = ws.status.room;

    if (room === null) return module_console.error('右键点击失败,没有找到房间', 'setMark', {}, callback);

    // 取出自己的player
    var player = room.player;

    var myself = player.filter(item => item.UserName === ws.status.user.UserName);

    if (myself.length !== 1) return module_console.error('右键点击失败,没有找到玩家', 'setMark', {}, callback);
    
    // 对局是否开始
    if (myself[0].Status === 0 || myself[0].Status === 1) return module_console.error('对局没有开始!', 'click', {}, callback);

    // 是否已失败/胜利
    if (myself[0].Status === 3 || myself[0].Status === 4) return module_console.error('你已经完成了对局!', 'setMark', {}, callback);

    // 点击坐标判断是否正确
    if (!(data.x >= 0 && data.x < room.Mode.Width && data.y >= 0 && data.y < room.Mode.Height)) {
        return module_console.error('右键点击失败,坐标不正确', 'setMark', {}, callback);
    }

    // 是否第一次点击
    if (!myself[0].isClick) {
        return; // 第一次必须左键点击
    }

    // 点击
    myself[0].mineData.setMark(data.x, data.y);
}

/**
 * 中键点击 <head:middle>
 * 坐标x ---- x <必传>
 * 坐标y ---- y <必传>
 */
event.middle = async (data, ws, callback) => {

    // 获取room
    var room = ws.status.room;

    if (room === null) return module_console.error('中键点击失败,没有找到房间', 'middle', {}, callback);

    // 取出自己的player
    var player = room.player;

    var myself = player.filter(item => item.UserName === ws.status.user.UserName);

    if (myself.length !== 1) return module_console.error('中键点击失败,没有找到玩家', 'middle', {}, callback);
    
    // 对局是否开始
    if (myself[0].Status === 0 || myself[0].Status === 1) return module_console.error('对局没有开始!', 'click', {}, callback);

    // 是否已失败/胜利
    if (myself[0].Status === 3 || myself[0].Status === 4) return module_console.error('你已经完成了对局!', 'middle', {}, callback);

    // 点击坐标判断是否正确
    if (!(data.x >= 0 && data.x < room.Mode.Width && data.y >= 0 && data.y < room.Mode.Height)) {
        return module_console.error('中键点击失败,坐标不正确', 'middle', {}, callback);
    }

    // 是否第一次点击
    if (!myself[0].isClick) {
        return; // 第一次必须左键点击
    }

    // 点击
    myself[0].mineData.middle(data.x, data.y);
}


console.log('--------------游戏模块初始完成');

module.exports = event;