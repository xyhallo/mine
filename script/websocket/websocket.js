/**
 * 模块 : websocket
 */
const WebSocket = require('ws'); // websocket模块
const gateway = require('./gateway'); // 网关模块
const dataAnalysis = require('./dataAnalysis'); // 数据分析模块

// 用户
global.UserList = {};
// 所有房间
global.RoomList = [];

exports.connection = function () {

    // 开启服务
    const wss = new WebSocket.Server({
        port: 9099
    });

    if (wss) {
        console.log("--------------服务器开启成功", "port:" + wss.options.port);
    } else {
        console.error("--------------服务器开启失败");
    };

    // 进入连接
    wss.on('connection', function connection(ws, req) {

        // console.log('有新用户进入..', getUUID())

        // 新用户进入，初始化状态
        ws.status = {
            isLogin: false,
            user: {},
            scene: {},
            status: 0, // 0:未登录  1:在大厅  2:在房间  3:在游戏
            roomId: null, // 房间ID
            room: null // 当前房间数据
        }

        // 网关初始化
        ws.gateway = new gateway(ws)


        /**
         * 收到数据处理
         * 数据统一格式:
         * { 
         *     Head : ''，
         *     Data : { }
         * }
         * 返回数据格式:
         * {
         *     Head : '',
         *     Data : '',
         *     Message : '' // 额外的信息 一般为错误信息
         *     Status : 200 // 200为正确 500为错误 
         * }
         */
        ws.on('message', function incoming(data) {
            // 网关
            ws.gateway.request(() => {

                try {
                    // 解析数据
                    let objData = JSON.parse(data);
                    // 处理数据
                    dataAnalysis.analysis(objData, ws, res => {
                        // 返回客户端数据
                        ws.send(JSON.stringify(res));
                    })
                } catch (error) {

                }

            })



        });

        // 玩家离开
        ws.on('close', function close() {
            if (ws.status.status !== 0) {
                try {
                    // 是否在房间内
                    if (ws.status.status === 2 || ws.status.status === 3) {
                        dataAnalysis.analysis({
                            Head: 'leaveRoom'
                        }, ws, res => {
                            delete global.UserList[ws.status.user.UserName];
                        })
                    } else {
                        delete global.UserList[ws.status.user.UserName];
                    }
                    console.log(ws.status.user.UserName + ' 用户离开')
                } catch (error) {
                    console.log('离开某用户的时候发生了错误')
                }
            }
        });

    });

    console.log('--------------websocket模块初始化完成');

}