/**
 * 模块 : 房间模块
 */

// 数据库操作模块
const sequelize = require('../../mysql/db');
// 信息返回模块
const module_console = require('../console/index');
// 扫雷核心模块
const module_mine = require('../mine/index');

var event = {};

/**
 * 获取房间列表 <head:getRoom>
 * 页数　　 ---- page <默认1>
 * 每页数量 ---- pageSize <默认20>
 */
event.getRoom = async (data, callback) => {

    // 验证传参数据
    try {
        if ('page' in data && isNaN(data.page)) return module_console.error('获取失败,页数错误', 'getRoom', {}, callback);
        if ('pageSize' in data && isNaN(data.pageSize)) return module_console.error('获取失败,每页数量', 'getRoom', {}, callback);
    } catch (error) {
        return module_console.error('房间列表格式错误', 'getRoom', {}, callback);
    }

    // 获取
    var page = 'page' in data ? data.page : 1;

    var pageSize = 'pageSize' in data ? data.pageSize : 20;

    var star = (page - 1) * pageSize;

    // 克隆数组
    var room = [...global.RoomList];
    var res = [];
    room.slice(star, pageSize).map(item => {

        var _item = {
            ...item
        };

        _item.nowNumber = _item.player.length;

        _item.player = null;

        _item.Password = _item.Password !== '';

        res.push(_item);
    });

    return module_console.info('获取房间数据成功', 'getRoom', {
        list: res,
        total: global.RoomList.length
    }, callback);
}

/**
 * 创建房间 <head:createRoom>
 * 房间名　 ---- Name <默认为玩家名+房间>
 * 房间密码 ---- Password <默认没有密码>
 * 最大人数 ---- Number <默认为8>
 * 模式　　 ---- Mode <1:初级 2:中级 3:高级 4:自定义 默认:高级>
 * 宽度　　 ---- Width <自定义使用 必传 最大:30>
 * 高度　　 ---- Height <自定义使用 必传 最大:24>
 * 雷数　　 ---- MineNum <自定义使用 必传 最多:92%>
 * 对局时间 ---- Time <最低1分钟 最大10分钟 默认10分钟>
 */
event.createRoom = async (data, ws, callback) => {
    // 验证玩家状态
    if (ws.status.status !== 1) return module_console.error('创建失败,你已在房间内', 'createRoom', {}, callback);

    // 验证传参数据
    try {
        if ('Name' in data && data.Name !== '' && data.Name.length > 12) return module_console.error('创建失败,房间名称过长', 'createRoom', {}, callback);
        if ('Password' in data && data.Password !== '' && data.Password.length > 12) return module_console.error('创建失败,房间密码过长', 'createRoom', {}, callback);
        if ('Number' in data && data.Number !== '' && (isNaN(data.Number) || data.Number < 1 || data.Number > 8)) return module_console.error('创建失败,最大人数不正确', 'createRoom', {}, callback);
        if ('Time' in data && data.Time !== '' && (isNaN(data.Time) || data.Time < 1 || data.Time > 10)) return module_console.error('创建失败,对局时间错误', 'createRoom', {}, callback);
        if ('Mode' in data) {
            switch (data.Mode) {
                case 1:
                    data.Width = 9;
                    data.Height = 9;
                    data.MineNum = 10;
                    break;
                case 2:
                    data.Width = 16;
                    data.Height = 16;
                    data.MineNum = 40;
                    break;
                case 3:
                    data.Width = 30;
                    data.Height = 16;
                    data.MineNum = 99;
                    break;
                case 4:
                    if (
                        isNaN(data.Width) ||
                        isNaN(data.Height) ||
                        isNaN(data.MineNum) ||
                        data.Width < 9 ||
                        data.Width > 30 ||
                        data.Height < 9 ||
                        data.Height > 24 ||
                        data.MineNum < 10 ||
                        data.MineNum > data.Width * data.Height * 0.92
                    ) {
                        return module_console.error('创建失败,自定义模式参数错误', 'createRoom', {}, callback);
                    }
                    break;
                default:
                    return module_console.error('创建失败,模式选择错误', 'createRoom', {}, callback);
                    break;
            }

        } else {
            data.Mode = 3;
            data.Width = 30;
            data.Height = 16;
            data.MineNum = 99;
        }
    } catch (error) {
        return module_console.error('房间数据格式错误', 'createRoom', {}, callback);
    }


    // 服务端保存的数据
    var defaultData = {
        // 可定义数据
        Name: data.Name || ws.status.user.NickName + '的房间', // 房间名
        Password: data.Password || '', // 房间密码
        Number: data.Number || 8, // 房间最大人数
        Time: data.Time || 10, // 对局时间
        // 不可定义数据
        Id: global.RoomList.length === 0 ? 1 : global.RoomList[global.RoomList.length - 1].Id + 1, // 房间Id
        Creator: ws.status.user.NickName, // 创建人
        Status: 1, // 房间最大状态 1:等待 2:正在游戏
        Mode: {
            Type: data.Mode,
            Width: data.Width,
            Height: data.Height,
            MineNum: data.MineNum,
        },
        owner: ws.status.user["UserName"],
        player: [{
            ws: ws, // 玩家的ws
            UserName: ws.status.user["UserName"], // 账号
            owner: true, // 是否为房主
            isClick: false, // 是否已点击第一次
            startTime: 0, // 玩家的开始时间
            endTime: 0, // 玩家的结束时间
            mineData: null,
            mine: {
                area: [], // 雷区
                areaShow: [], // 已经点过的区域
                mark: [], // 插旗的区域
                nowShow: 0, // 当前显示数
                nowMark: 0, // 当前标记数
            }, // 当前玩家的雷区数据
            Status: 0 // 玩家状态 0:未准备 1:已准备 2:正在游戏 3:失败 4:胜利
        }] // 房间玩家 [创建者默认已加入]
    }

    // 返回给客户端的数据
    var returnData = {
        // 可定义数据
        Name: data.Name || ws.status.user.NickName + '的房间',
        Password: data.Password || '',
        Number: data.Number || 8,
        Time: data.Time || 10,
        // 不可定义数据
        Id: global.RoomList.length === 0 ? 1 : global.RoomList[global.RoomList.length - 1].Id + 1, // 房间Id
        Creator: ws.status.user.NickName, // 创建人
        Status: 1, // 房间最大状态 1:等待 2:正在游戏
        Mode: {
            Type: data.Mode,
            Width: data.Width,
            Height: data.Height,
            MineNum: data.MineNum,
        },
        owner: ws.status.user["NickName"],
        player: [{
            owner: true, // 是否为房主
            message: { // 玩家的信息
                UserMsg: {
                    NickName: ws.status.user["NickName"],
                    Gender: ['未知', '男', '女'][ws.status.user["Gender"]],
                    LastIp: ws.status.user["LastIp"],
                },
                SceneMsg: ws.status.scene
            },
            mine: {
                nowShow: 0, // 当前显示数
                nowMark: 0, // 当前标记数
            },
            Status: 0
        }]
    }

    // 重置玩家状态到房间
    ws.status.status = 2;

    // 设置当前用户房间ID
    ws.status.roomId = parseInt(returnData.Id);

    var index = global.RoomList.push(defaultData);

    ws.status.room = global.RoomList[index - 1];

    // 散发消息给所有用户
    for (var key in global.UserList) {
        module_console.log('新的房间创建', 'newRoom', {
            ...ws.status.room,
            nowNumber: ws.status.room.player.length,
            player: null,
            Password: ws.status.Password !== ''
        }, global.UserList[key]);
    }

    return module_console.info('创建房间成功', 'createRoom', returnData, callback);
}

/**
 * 加入房间 <head:addRoom>
 * 房间ID ---- id <必须传参>
 * 密码   ---- Password <默认为空>
 */
event.addRoom = async (data, ws, callback) => {
    // 验证传参数据
    try {
        if ('id' in data && isNaN(data.id)) return module_console.error('加入房间失败,找不到id', 'addRoom', {}, callback);
    } catch (error) {
        return module_console.error('房间数据格式错误', 'addRoom', {}, callback);
    }

    if (!('Password' in data)) data.Password = '';

    if (!(typeof data.id === 'string' || typeof data.id === 'number')) return module_console.error('加入房间失败,id类型不正确', 'addRoom', {}, callback);

    // 获取当前房间
    var nowRoom = data.id;

    var roomMsg = global.RoomList.filter(item => item.Id == nowRoom);

    if (roomMsg.length != 1) return module_console.error('加入房间失败,没有获取到当前的房间数据', 'addRoom', {}, callback);

    var room = roomMsg[0];

    if (room.Status === 2) return module_console.error('加入房间失败,该房间正在游戏', 'addRoom', {}, callback);

    if (room.Password !== data.Password) return module_console.error('加入房间失败,密码错误', 'addRoom', {}, callback);

    if (room.player.length >= room.Number) return module_console.error('加入房间失败,人数已满', 'addRoom', {}, callback);

    if (ws.status.room !== null || ws.status.roomId !== null) return module_console.error('加入房间失败,你已经加入了某个房间', 'addRoom', {}, callback);

    // 加入房间
    var player = {
        ws: ws, // 玩家的ws
        UserName: ws.status.user["UserName"], // 账号
        owner: false, // 是否为房主
        isClick: false, // 是否已点击第一次
        startTime: 0, // 玩家的开始时间
        endTime: 0, // 玩家的结束时间
        mineData: null,
        mine: {
            area: [], // 雷区
            areaShow: [], // 已经点过的区域
            mark: [], // 插旗的区域
            nowShow: 0, // 当前显示数
            nowMark: 0, // 当前标记数
        }, // 当前玩家的雷区数据
        Status: 0 // 玩家状态 0:未准备 1:已准备 2:正在游戏 3:失败 4:胜利
    }

    var player_client = {
        owner: false, // 是否为房主
        message: { // 玩家的信息
            UserMsg: {
                NickName: ws.status.user["NickName"],
                Gender: ['未知', '男', '女'][ws.status.user["Gender"]],
                LastIp: ws.status.user["LastIp"],
            },
            SceneMsg: ws.status.scene
        },
        mine: {
            nowShow: 0, // 当前显示数
            nowMark: 0, // 当前标记数
        },
        Status: 0
    }

    var onwer = '';
    // 转播消息
    room.player.forEach(item => {
        module_console.log('其他玩家加入', 'otherAdd', {
            player: player_client, // 加入的人信息
        }, item.ws);

        if (item.owner) {
            owner = item.ws.status.user["NickName"];
        }
    });

    room.player.push(player);

    // 给加入的人房间信息
    var returnData = {
        ...room,
        owner: owner,
        player: playerToClient(room.player)
    };

    // 重置玩家状态到房间
    ws.status.status = 2;

    // 设置当前用户房间ID
    ws.status.roomId = parseInt(nowRoom);

    ws.status.room = room;

    return module_console.info('加入房间成功', 'addRoom', returnData, callback);

}

/**
 * 离开当前房间
 */
event.leaveRoom = async (data, ws, callback) => {

    // 获取当前房间
    var nowRoom = ws.status.roomId;

    if (nowRoom === null) return module_console.error('离开房间失败,没有获取到当前的房间数据', 'leaveRoom', {}, callback);

    var roomMsg = global.RoomList.filter(item => item.Id == nowRoom);

    if (roomMsg.length != 1) return module_console.error('离开房间失败,没有获取到当前的房间数据', 'leaveRoom', {}, callback);

    // 取当前房间玩家
    var player = roomMsg[0].player;

    // 离开玩家
    var leaveNickName = ws.status.user.NickName;
    var isOwner = false;
    var needDeleteOther = false;
    var otherName = false;
    // console.log('player', player.length)
    player = player.filter(item => {
        if (item.ws.status.user.UserName === ws.status.user.UserName) {
            if (item.owner) {
                isOwner = true;
            }
            // 如果在游戏内，则直接判定失败
            // console.log('是否在有游戏内', item.ws.status.status)
            if (item.ws.status.status === 3) {
                try {
                    item.mineData.exit();
                    needDeleteOther = true;
                    otherName = item.ws.status.user.UserName;
                } catch (error) {}
            }
        }
        return item.ws.status.user.UserName !== ws.status.user.UserName;
    });

    // 是否需要删除其他玩家里的离开玩家对象
    if (needDeleteOther) {
        player.forEach(item => {
            try {
                item.mineData.deleteOther(otherName);
            } catch (error) {

            }
        })
    }

    // 如果房间没有玩家,则销毁 否则给其他玩家发送该玩家离开信息
    // console.log('****************AAA*********************')
    // player.forEach(item => {
    //     console.log('当前房间玩家', item.ws.status.user.NickName)

    // })
    // console.log('****************AAA*********************')
    // console.log('剩余用户', player.length)
    if (player.length === 0) {
        var otherRoom = global.RoomList.filter(item => item.Id !== nowRoom);

        console.log('销毁房间 id:', nowRoom, otherRoom)
        global.RoomList = otherRoom;


        // 散发消息给所有用户
        for (var key in global.UserList) {
            module_console.log('销毁房间', 'destoryRoom', {
                id: nowRoom
            }, global.UserList[key]);
        }
    } else {

        // 如果离开的玩家为房主 则把房主给当前player的第一个
        if (isOwner) {
            player[0].owner = true;
            roomMsg[0].owner = player[0].ws.status.user.UserName;
            console.log('转让房主 id:', player[0].ws.status.user.NickName)
        }

        // 广播消息
        player.forEach(item => {
            module_console.log('其他玩家离开', 'otherLeaveRoom', {
                NickName: leaveNickName, // 离开的人
                newOwner: player[0].ws.status.user.NickName // 新房主
            }, item.ws);
        });


    }
    roomMsg[0].player = player;
    // console.log('******************BBB*******************')
    // roomMsg[0].player.forEach(item => {
    //     console.log('当前房间玩家', item.ws.status.user.NickName)
    // })
    // console.log('******************BBB*******************')

    // 设置当前用户房间ID
    ws.status.roomId = null;
    ws.status.room = null;

    // 重置玩家状态到大厅
    ws.status.status = 1;


    return module_console.info('离开房间成功', 'leaveRoom', {}, callback);
}

/**
 * 玩家准备
 */
event.ready = async (data, ws, callback) => {

    // 获取当前房间
    var nowRoom = ws.status.roomId;

    if (nowRoom === null) return module_console.error('准备失败,没有获取到当前的房间数据', 'ready', {}, callback);

    var roomMsg = global.RoomList.filter(item => item.Id == nowRoom);

    if (roomMsg.length != 1) return module_console.error('准备失败,没有获取到当前的房间数据', 'ready', {}, callback);

    // 取当前房间玩家
    var player = roomMsg[0].player;

    // 更改自己的状态
    var success = false;
    var readyNickName = '';
    for (var i = 0; i < player.length; i++) {
        if (player[i].UserName === ws.status.user.UserName) {
            if (player[i].Status === 0) {
                player[i].Status = 1;
                readyNickName = player[i].ws.status.user.NickName;
                break;
            } else {
                success = true;
                break;
            }
        }
    }

    if (success) return module_console.error('准备失败,当前的状态不允许准备', 'ready', {}, callback);

    // 广播消息
    player.forEach(item => {
        module_console.log('玩家准备', 'playerReady', {
            NickName: readyNickName, // 准备的人
        }, item.ws);
    });

    // return module_console.error('离开房间成功', 'ready', {}, callback);
}

/**
 * 玩家取消准备
 */
event.offReady = async (data, ws, callback) => {

    // 获取当前房间
    var nowRoom = ws.status.roomId;

    if (nowRoom === null) return module_console.error('取消准备失败,没有获取到当前的房间数据', 'offReady', {}, callback);

    var roomMsg = global.RoomList.filter(item => item.Id == nowRoom);

    if (roomMsg.length != 1) return module_console.error('取消准备失败,没有获取到当前的房间数据', 'offReady', {}, callback);

    // 取当前房间玩家
    var player = roomMsg[0].player;

    // 更改自己的状态
    var success = false;
    var readyNickName = '';
    for (var i = 0; i < player.length; i++) {
        if (player[i].UserName === ws.status.user.UserName) {
            if (player[i].Status === 1) {
                player[i].Status = 0;
                readyNickName = player[i].ws.status.user.NickName;
            } else {
                success = true;
                break;
            }
        }
    }

    if (success) return module_console.error('取消准备失败,当前的状态不允许准备', 'offReady', {}, callback);

    // 广播消息
    player.forEach(item => {
        module_console.log('玩家取消准备', 'playerOffReady', {
            NickName: readyNickName, // 取消准备的人
        }, item.ws);
    });

    // return module_console.error('离开房间成功', 'ready', {}, callback);
}

/**
 * 开始游戏
 */
event.start = async (data, ws, callback) => {

    // 获取当前房间
    var nowRoom = ws.status.roomId;

    if (nowRoom === null) return module_console.error('开始失败,没有获取到当前的房间数据', 'start', {}, callback);

    var roomMsg = global.RoomList.filter(item => item.Id == nowRoom);

    if (roomMsg.length != 1) return module_console.error('开始失败,没有获取到当前的房间数据', 'start', {}, callback);

    // 是否已经开始
    if (roomMsg[0].Status === 2) return module_console.error('开始失败,游戏已经开始', 'start', {}, callback);

    // 是否为房主
    if (roomMsg[0].owner !== ws.status.user.UserName) return module_console.error('开始失败,你不是房主', 'start', {}, callback);

    // 取当前房间玩家   
    var player = roomMsg[0].player;

    // 是否全部准备完毕
    var allOk = player.filter(item => item.Status == 0);
    // console.log(allOk)
    if (allOk.length > 0) return module_console.error('开始失败,所有玩家未准备完毕', 'start', {}, callback);


    // 布广播消息
    roomMsg[0].Status = 2; // 状态更改为开始游戏
    player.forEach(item => {
        item.Status = 2;
        item.ws.status.status = 3; // 玩家状态更改为游戏中
        item.startTime = new Date().valueOf(); // 设置开始时间
        item.mineData = new module_mine(roomMsg[0].Mode, player, item, roomMsg[0]);

        // 所有player到数组
        var playerArr = [];
        player.forEach(item2 => {
            var n = item2.ws.status.user["NickName"];
            if (n != item.ws.status.user["NickName"]) {
                playerArr.push(n);
            }
        });

        module_console.log('游戏开始', 'startGame', {
            mode: roomMsg[0].Mode,
            // startTime: item.startTime,
            time: roomMsg[0].Time,
            player: playerArr,
            NickName: item.ws.status.user["NickName"]
        }, item.ws);
    });

    // return module_console.error('离开房间成功', 'ready', {}, callback);
}


/**
 * 方法:player转换为client
 */
function playerToClient(player) {
    var returnPlayer = [];
    player.forEach(item => {
        returnPlayer.push({
            owner: item.owner, // 是否为房主
            message: { // 玩家的信息
                UserMsg: {
                    NickName: item.ws.status.user["NickName"],
                    Gender: ['未知', '男', '女'][item.ws.status.user["Gender"]],
                    LastIp: item.ws.status.user["LastIp"],
                },
                SceneMsg: item.ws.status.scene
            },
            mine: {
                nowShow: item.mine.nowShow, // 当前显示数
                nowMark: item.mine.nowMark, // 当前标记数
            },
            Status: item.Status
        })
    });
    return returnPlayer;
}


console.log('--------------房间模块初始完成');

module.exports = event;