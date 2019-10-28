/**
 * 模块 : 数据分析
 * 功能 : 派发数据到各个模块进行处理
 */

// 信息返回模块
const module_console = require('../modules/console/index');
// 登录模块
const module_login = require('../modules/login/index');
// 房间模块
const module_room = require('../modules/room/index');
// 游戏模块
const module_game = require('../modules/game/index');
// 扫雷核心模块
const module_mine = require('../modules/mine/index');

var event = {};

// 处理数据
event.analysis = function (data, ws, callback) {

    // 分配登录
    if (ws.status.isLogin) {

        switch (data.Head) {
            case 'getRoom': // 获取房间
                module_room.getRoom(data.Data, callback);
                break;
            case 'createRoom': // 创建房间
                module_room.createRoom(data.Data, ws, callback);
                break;
            case 'leaveRoom': // 离开房间
                module_room.leaveRoom(data.Data, ws, callback);
                break;
            case 'addRoom': // 加入房间
                module_room.addRoom(data.Data, ws, callback);
                break;
            case 'ready': // 准备
                module_room.ready(data.Data, ws, callback);
                break;
            case 'offReady': // 取消准备
                module_room.offReady(data.Data, ws, callback);
                break;
            case 'start': // 开始游戏
                module_room.start(data.Data, ws, callback);
                break;
            case 'click': // 点击雷
                module_game.click(data.Data, ws, callback);
                break;
            case 'setMark': // 右键点击
                module_game.setMark(data.Data, ws, callback);
                break;
            case 'middle': // 中键点击
                module_game.middle(data.Data, ws, callback);
                break;
            default:
                module_console.error(`不支持的接口 [${data.Head}]`, data.Head, {}, callback);
                break;
        }


    } else {

        switch (data.Head) {
            case 'login': // 登录
                module_login.login(data.Data, ws, callback);
                break;
            case 'regist': // 注册
                module_login.regist(data.Data, callback);
                break;
            default:
                module_console.error(`不支持的接口 [${data.Head}]`, data.Head, {}, callback);
                break;
        }

    }

}

console.log('--------------数据解析模块初始完成');
module.exports = event;