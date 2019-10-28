/**
 * 模块 : 数据处理 (room)
 */
const ROOM_STATUS_WRIT = 1;
const ROOM_STATUS_STATRT = 2;
var room = [];

var func = {};

/**
 * 创建房间
 */
func.creat = (data, callback) => {

    let msg = {
        roomId: room.length + 1,
        roomName: data.roomName,
        roomNum: 1,
        status: ROOM_STATUS_WRIT
    };

    room.push(msg);

    callback({
        head: 'creatRoom',
        data: {
            msg: '创建房间成功',
            roomMsg: msg,
            status: true
        }
    });
}

/**
 * 获取放假
 */
func.get = (callback) => {

    callback({
        head: 'getRoom',
        data: {
            rows: room,
            status: true
        }
    });

}

module.exports = func;