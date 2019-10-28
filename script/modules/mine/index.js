/**
 * 模块 : 扫雷核心模块
 */

// 数据库操作模块
const sequelize = require('../../mysql/db');
// 信息返回模块
const module_console = require('../console/index');

// Scene表数据模型
const SceneModel = sequelize.define('scene', {
    Id: {
        type: sequelize.Types.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    UserId: sequelize.Types.INTEGER,
    Scene: sequelize.Types.INTEGER,
    WinScene: sequelize.Types.INTEGER,
    FailScene: sequelize.Types.INTEGER,
    LevelOne: sequelize.Types.INTEGER,
    LevelTwo: sequelize.Types.INTEGER,
    LevelThree: sequelize.Types.INTEGER,
    LevelOneWin: sequelize.Types.INTEGER,
    LevelTwoWin: sequelize.Types.INTEGER,
    LevelThreeWin: sequelize.Types.INTEGER,
    MaxTimeOne: sequelize.Types.INTEGER,
    MaxTimeTwo: sequelize.Types.INTEGER,
    MaxTimeThree: sequelize.Types.INTEGER
}, {
    tableName: "scene",
    freezeTableName: true,
    timestamps: false
})

// 定义雷区常量
const STATU_NULL = 0, // 没有雷
    STATU_MINE = -1; // 雷

// 生成范围随机数
function rd(n, m) {
    var c = m - n + 1;
    return Math.floor(Math.random() * c + n);
}

// 雷区
function Mine(mode, player, myself, room) {
    this.Type = mode.Type; // 类型
    this.width = mode.Width; // 宽度
    this.height = mode.Height; // 高度
    this.mineNum = mode.MineNum; // 雷数
    this.markNum = 0; // 已标记数量
    this.areaSize = this.width * this.height; // 区域大小
    this.player = player; // 所有房间内玩家
    this.myself = myself; // 自己
    this.noMsg = false; // 不接收消息
    this.room = room;
    this.init();
    this.starInterval();
}

// 初始化雷区
Mine.prototype.init = function () {

    // 初始化雷区数组
    this.mineData = {
        area: new Array(this.height), // 雷区
        areaShow: new Array(this.height), // 该区域是否显示
        areaMark: new Array(this.height), // 该区域是否标记
    }

    for (var i = 0; i < this.height; i++) {
        this.mineData.area[i] = [];
        this.mineData.areaShow[i] = [];
        this.mineData.areaMark[i] = [];
        for (var v = 0; v < this.width; v++) {
            this.mineData.area[i].push(STATU_NULL)
            this.mineData.areaShow[i].push(false)
            this.mineData.areaMark[i].push(false)
        }
    }

}

// 转换坐标方法
Mine.prototype.ConversionCoordinates = function (y, x) {
    return y * this.width + x;
}

// 生成雷区
Mine.prototype.generateMineArea = function (x, y) {

    // 必定没雷的地方 [必定是0]
    this.nullMine = [this.ConversionCoordinates(y, x)]
    // left 是否有格子
    x - 1 < 0 ? '' : this.nullMine.push(this.ConversionCoordinates(y, x - 1));
    // top 是否有格子
    y - 1 < 0 ? '' : this.nullMine.push(this.ConversionCoordinates(y - 1, x));
    // right 是否有格子
    x + 1 >= this.width ? '' : this.nullMine.push(this.ConversionCoordinates(y, x + 1));
    // bottom 是否有格子
    y + 1 >= this.height ? '' : this.nullMine.push(this.ConversionCoordinates(y + 1, x));
    // left_top 是否有格子
    x - 1 < 0 || y - 1 < 0 ? '' : this.nullMine.push(this.ConversionCoordinates(y - 1, x - 1));
    // right_top 是否有格子
    x + 1 >= this.width || y - 1 < 0 ? '' : this.nullMine.push(this.ConversionCoordinates(y - 1, x + 1));
    // left_bottom 是否有格子
    x - 1 < 0 || y + 1 >= this.height ? '' : this.nullMine.push(this.ConversionCoordinates(y + 1, x - 1));
    // right_bottom 是否有格子
    x + 1 >= this.width || y + 1 >= this.height ? '' : this.nullMine.push(this.ConversionCoordinates(y + 1, x + 1));
    // 排序

    this.nullMine.sort((a, b) => {
        return b - a;
    });
    // 生成随机雷区
    var allArr = Array.from(new Array(this.areaSize).keys());

    // 去除无雷区域
    this.nullMine.forEach(item => {
        allArr.splice(item, 1);
    })

    while (allArr.length !== this.mineNum) {
        var d = rd(0, allArr.length);
        allArr.splice(d, 1);
    }

    for (var i = 0; i < allArr.length; i++) {
        var x = allArr[i] % this.width;
        var y = (allArr[i] - x) / this.width;
        this.mineData.area[y][x] = STATU_MINE;
    }

    // 生成雷区数字
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            if (this.mineData.area[y][x] != -1) {
                var num = 0;
                var left = x - 1 < 0 ? 0 : this.mineData.area[y][x - 1] == -1 ? 1 : 0;
                var top = y - 1 < 0 ? 0 : this.mineData.area[y - 1][x] == -1 ? 1 : 0;
                var right = x + 1 >= this.width ? 0 : this.mineData.area[y][x + 1] == -1 ? 1 : 0;
                var bottom = y + 1 >= this.height ? 0 : this.mineData.area[y + 1][x] == -1 ? 1 : 0;
                var left_top = x - 1 < 0 || y - 1 < 0 ? 0 : this.mineData.area[y - 1][x - 1] == -1 ? 1 : 0;
                var right_top = x + 1 >= this.width || y - 1 < 0 ? 0 : this.mineData.area[y - 1][x + 1] == -1 ? 1 :
                    0;
                var left_bottom = x - 1 < 0 || y + 1 >= this.height ? 0 : this.mineData.area[y + 1][x - 1] == -1 ? 1 :
                    0;
                var right_bottom = x + 1 >= this.width || y + 1 >= this.height ? 0 : this.mineData.area[y + 1][x + 1] == -
                    1 ? 1 : 0;
                num = left + top + right + bottom + left_top + right_top + left_bottom + right_bottom;
                this.mineData.area[y][x] = num;
            }
        }
    }

}

// 左键操作
Mine.prototype.click = function (x, y) {
    if (this.mineData.areaMark[y][x] == true) return; // console.log('插旗无法点');
    if (this.mineData.areaShow[y][x] == true) return; // console.log('已经点过了');
    if (this.mineData.area[y][x] == -1) { // 输了
        this.fail();
        return;
    }

    // 点击成功, 如果没有雷 
    if (this.mineData.area[y][x] == 0) {
        this.showAround(x, y);
    } else {
        this.setShow(x, y);
        this.win();
    }

}

// 显示周围区域
Mine.prototype.showAround = function (x, y) {
    this.setShow(x, y);
    // 没有这个格子就是0 如果没雷和数字就是1 否则是2 

    // left 是否有格子
    x - 1 < 0 ? '' : this.mineData.areaShow[y][x - 1] ? '' : show(this, y, x - 1);
    // top 是否有格子
    y - 1 < 0 ? '' : this.mineData.areaShow[y - 1][x] ? '' : show(this, y - 1, x);
    // right 是否有格子
    x + 1 >= this.width ? '' : this.mineData.areaShow[y][x + 1] ? '' : show(this, y, x + 1);
    // bottom 是否有格子
    y + 1 >= this.height ? '' : this.mineData.areaShow[y + 1][x] ? '' : show(this, y + 1, x);

    // left_top 是否有格子
    x - 1 < 0 || y - 1 < 0 ? '' : this.mineData.areaShow[y - 1][x - 1] ? '' : show(this, y - 1, x - 1);
    // right_top 是否有格子
    x + 1 >= this.width || y - 1 < 0 ? '' : this.mineData.areaShow[y - 1][x + 1] ? '' : show(this, y - 1, x + 1);
    // left_bottom 是否有格子
    x - 1 < 0 || y + 1 >= this.height ? '' : this.mineData.areaShow[y + 1][x - 1] ? '' : show(this, y + 1, x - 1);
    // right_bottom 是否有格子
    x + 1 >= this.width || y + 1 >= this.height ? '' : this.mineData.areaShow[y + 1][x + 1] ? '' : show(this, y + 1, x + 1);

    function show(_this, y, x) {
        // console.log('需要显示', y, x)
        _this.setShow(x, y);
        _this.win();
        // 是否为0 如果为0 则继续扩展显示
        if (_this.mineData.area[y][x] == 0) {
            _this.showAround(x, y);
        }
    }

}

// 设置显示区域
Mine.prototype.setShow = function (x, y) {
    this.mineData.areaShow[y][x] = true
    this.sendAll('显示位置', 'showPosition', {
        NickName: this.myself.ws.status.user.NickName,
        x: x,
        y: y,
        num: this.mineData.area[y][x]
    })
}

// 标记插旗（右键）
Mine.prototype.setMark = function (x, y) {
    // 是否已经点开
    if (this.mineData.areaShow[y][x] == true) return; //console.log('已经点过了');

    // 开始标记
    this.mineData.areaMark[y][x] = !this.mineData.areaMark[y][x];
    this.mineData.areaMark[y][x] ? this.markNum++ : this.markNum--;
    this.sendAll('标记位置', 'setMarkPosition', {
        NickName: this.myself.ws.status.user.NickName,
        x: x,
        y: y,
        markNum: this.mineNum - this.markNum,
        status: this.mineData.areaMark[y][x]
    })
}

// 中键操作
Mine.prototype.middle = function (x, y) {
    if (!this.mineData.areaShow[y][x]) return; // console.log('该处未出现');
    if (this.mineData.area[y][x] == 0) return; // console.log('该出为0');

    // 周围雷总数
    var num = this.mineData.area[y][x];
    // 取周围标记总数
    var markNum = this.getMarkNum(x, y);
    // 获取可操作位置/显示位置/已标记数量
    var canHandle = [];
    var showPosition = [];
    var nowMarkNum = [];
    for (var key in markNum) {
        // 可操作位置
        if (markNum[key]['z'] == 3) canHandle.push(key);
        // 已显示位置
        if (markNum[key]['z'] == 2) showPosition.push(key);
        // 为标记
        if (markNum[key]['z'] == 1) nowMarkNum.push(key);
    }
    // 如果标记数量等于地雷数量
    if (this.mineData.area[y][x] == nowMarkNum.length) {

        // 判断是否标记准确
        for (var i = 0; i < nowMarkNum.length; i++) {
            var indexPosition = markNum[nowMarkNum[i]];
            if (this.mineData.area[indexPosition.y][indexPosition.x] != -1) {
                return this.fail();
            }
        }

        // 开启周围格子
        for (var i = 0; i < canHandle.length; i++) {
            var indexPosition = markNum[canHandle[i]];
            this.click(indexPosition.x, indexPosition.y);
        }
    }

}

// 取标记总数
Mine.prototype.getMarkNum = function (x, y) {
    // 0:没有格子 1:已标记 2:已显示 3:有格子 没标记 没显示
    var marks = {
        left: {
            z: x - 1 < 0 ? 0 : this.mineData.areaMark[y][x - 1] ? 1 : this.mineData.areaShow[y][x - 1] ? 2 : 3,
            x: x - 1,
            y: y
        },
        top: {
            z: y - 1 < 0 ? 0 : this.mineData.areaMark[y - 1][x] ? 1 : this.mineData.areaShow[y - 1][x] ? 2 : 3,
            x: x,
            y: y - 1
        },
        right: {
            z: x + 1 >= this.width ? 0 : this.mineData.areaMark[y][x + 1] ? 1 : this.mineData.areaShow[y][x + 1] ? 2 : 3,
            x: x + 1,
            y: y
        },
        bottom: {
            z: y + 1 >= this.height ? 0 : this.mineData.areaMark[y + 1][x] ? 1 : this.mineData.areaShow[y + 1][x] ? 2 : 3,
            x: x,
            y: y + 1
        },
        left_top: {
            z: x - 1 < 0 || y - 1 < 0 ? 0 : this.mineData.areaMark[y - 1][x - 1] ? 1 : this.mineData.areaShow[y - 1][
                x - 1
            ] ? 2 : 3,
            x: x - 1,
            y: y - 1
        },
        right_top: {
            z: x + 1 >= this.width || y - 1 < 0 ? 0 : this.mineData.areaMark[y - 1][x + 1] ? 1 : this.mineData.areaShow[
                y - 1][x + 1] ? 2 : 3,
            x: x + 1,
            y: y - 1
        },
        left_bottom: {
            z: x - 1 < 0 || y + 1 >= this.height ? 0 : this.mineData.areaMark[y + 1][x - 1] ? 1 : this.mineData.areaShow[
                y + 1][x - 1] ? 2 : 3,
            x: x - 1,
            y: y + 1
        },
        right_bottom: {
            z: x + 1 >= this.width || y + 1 >= this.height ? 0 : this.mineData.areaMark[y + 1][x + 1] ? 1 : this
                .mineData.areaShow[y + 1][x + 1] ? 2 : 3,
            x: x + 1,
            y: y + 1
        }
    }

    return marks;
}

// 判定输
Mine.prototype.fail = function () {
    // 更新状态
    this.myself.Status = 3;
    this.myself.endTime = new Date().valueOf();
    // 广播消息
    this.sendAll(`玩家:${this.myself.ws.status.user.NickName}输了`, 'gameOver', {
        NickName: this.myself.ws.status.user.NickName,
        win: false,
        time: (this.myself.endTime - this.myself.startTime) / 1000,
        area: this.mineData.area
    })
    // 更新数据库
    this.setDatabase(false);
    // 验证是否完成对局
    this.completeGame();
}

// 判断赢
Mine.prototype.win = function () {
    var shownum = 0;
    for (var i = 0; i < this.mineData.areaShow.length; i++) {
        for (var v = 0; v < this.mineData.areaShow[i].length; v++) {
            if (!this.mineData.areaShow[i][v]) {
                shownum++;
            }
        }
    }
    if (shownum === this.mineNum) {
        // 更新状态
        this.myself.Status = 4;
        this.myself.endTime = new Date().valueOf();
        // 广播消息
        this.sendAll(`玩家:${this.myself.ws.status.user.NickName}已经完成了扫雷`, 'gameOver', {
            NickName: this.myself.ws.status.user.NickName,
            win: true,
            time: (this.myself.endTime - this.myself.startTime) / 1000,
            area: this.mineData.area
        })
        // 更新数据库
        this.setDatabase(true);
        // 验证是否完成对局
        this.completeGame();
    }
}

// 判定输
Mine.prototype.exit = function () {
    console.log(this.myself.UserName, '强制退出了游戏')
    // 更新状态
    this.noMsg = true;
    this.myself.Status = 3;
    this.myself.startTime = 0;
    this.myself.endTime = 10000000;
    // 广播消息
    this.sendAll(`玩家:${this.myself.ws.status.user.NickName}离开了游戏`, 'gameOver', {
        NickName: this.myself.ws.status.user.NickName,
        win: false,
        time: (this.myself.endTime - this.myself.startTime) / 1000,
        area: []
    })
    // 更新数据库
    this.setDatabase(false, true);
}

// 是否已完成对局
Mine.prototype.completeGame = function () {
    var isOk = true;
    for (var i = 0; i < this.player.length; i++) {
        if (this.player[i].Status == 2) {
            isOk = false;
            break;
        }
    }
    // 已完成对局
    if (isOk) {
        // 计算排名
        var pl = [...this.player];
        pl.sort((a, b) => {
            return (a.endTime - a.startTime) - (b.endTime - b.startTime)
        })
        // 组合排名
        var returnData = [];
        pl.forEach((item, index) => {
            returnData.push({
                No: index + 1,
                NickName: item.ws.status.user.NickName,
                Time: (item.endTime - item.startTime) / 1000,
                win: item.Status === 4
            })
        })
        // 广播消息
        this.sendAll('对局完成', 'completeGame', {
            sort: returnData
        })
        // 重置player数据
        this.player.forEach(item => {
            item.isClick = false;
            item.startTime = 0;
            item.endTime = 0;
            item.mineData = null;
            item.Status = 0;
        })
        this.room.Status = 1;
    }
}

// 倒计时，时间到了强制结束游戏
Mine.prototype.starInterval = function () {
    var s = this.room.Time * 60 * 1000;
    // 开始计时
    setTimeout(() => {
        // 强制结束游戏
        this.player.forEach(item => {
            if (item.Status == 2) {
                item.endTime = new Date().valueOf();
            }
            if (item.Status != 4) {
                item.Status = 3;
            }

        })
        // 完成对局
        this.completeGame();

    }, s);
}

// 删除离开玩家
Mine.prototype.deleteOther = function (UserName) {
    this.player = this.player.filter(item => item.ws.status.user["UserName"] !== UserName);
}

// 批量发送信息
Mine.prototype.sendAll = function (msg, head, data) {
    this.player.forEach(item => {
        if (item.endTime !== 10000000 || this.noMsg) {
            module_console.log(msg, head, data, item.ws);
        }
    });
}

// 更新玩家数据库 [true = win;false = fail]
Mine.prototype.setDatabase = function (isWin, remove) {
    var _this = this;
    var myself = {
        ...this.myself
    };
    var sql = {
        Scene: sequelize.literal('`Scene` +1'), // 场次+1
        [isWin ? 'WinScene' : 'FailScene']: sequelize.literal('`' + (isWin ? 'WinScene' : 'FailScene') + '` +1')
    };
    this.myself.ws.status.scene.Scene += 1; // 更新服务器数据
    this.myself.ws.status.scene[isWin ? 'WinScene' : 'FailScene'] += 1; // 更新服务器数据
    // 等级场次
    if (this.Type === 1 || this.Type === 2 || this.Type === 3) {

        var typeName = ['', 'One', 'Two', 'Three'][this.Type];
        // 等级场次
        sql['Level' + typeName] = sequelize.literal('`Level' + typeName + '` +1');
        this.myself.ws.status.scene['Level' + typeName] += 1; // 更新服务器数据
        if (isWin) {
            // 等级赢场次
            sql['Level' + typeName + 'Win'] = sequelize.literal('`Level' + typeName + 'Win` +1');
            this.myself.ws.status.scene['Level' + typeName + 'Win'] += 1; // 更新服务器数据
            // 最快时间更新
            SceneModel.findAll({
                where: {
                    UserId: myself.ws.status.user.Id
                }
            }).then(res => {
                // console.log('查询res', res.length, res[0]['Scene'])
                if (res.length === 1) {
                    var oldTime = res[0]['MaxTime' + typeName];
                    var newTime = myself.endTime - myself.startTime

                    if (oldTime > newTime || oldTime === 0) {
                        sql['MaxTime' + typeName] = newTime;
                        this.myself.ws.status.scene['MaxTime' + typeName] = newTime; // 更新服务器数据
                    }
                }
                send();
            })

        } else {
            send();
        }

    }

    function send() {
        SceneModel.update(sql, {
            where: {
                UserId: myself.ws.status.user.Id
            }
        }).then(res => {
            console.log(myself.ws.status.user.UserName, '用户信息更新完成', res)
            module_console.log('更新数据', 'updateMsg', myself.ws.status.scene, myself.ws);
            // _this.myself.mineData = {}; // 销毁mine对象
            myself = {};
            if (remove) {
                // 从player中移除
                // console.log('移除前', _this.player.length)
                _this.player = _this.player.filter(item => item.ws.status.user["UserName"] !== _this.myself.ws.status.user["UserName"])
                // console.log('移除后', _this.player.length)
                // 验证是否完成对局
                _this.completeGame();
            }
        }).catch(err => {
            console.log('更新数据库失败')
        })
    }



}


console.log('--------------扫雷核心模块初始完成');
module.exports = Mine;