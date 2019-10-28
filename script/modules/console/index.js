/**
 * 模块 : 信息返回模块
 */

var event = {};

/** 
 * 返回正确信息
 * msg:信息
 * head:请求
 * data:返回数据
 * callback:回调
 */

event.info = function (msg, head, data, callback) {
    callback({
        Head: head,
        Data: data,
        Message: msg,
        Status: 200
    })
}

/** 
 * 返回错误信息
 */

event.error = function (msg, head, data, callback) {
    callback({
        Head: head,
        Data: data,
        Message: msg,
        Status: 500
    })
}

/** 
 * 发送无回调数据
 */
event.log = function (msg, head, data, ws) {
    ws.send(JSON.stringify({
        Head: head,
        Data: data,
        Message: msg,
        Status: 200
    }))
}



module.exports = event;