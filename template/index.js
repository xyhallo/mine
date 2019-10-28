if (!debuggermode) console.log = function () {};
var ws = new WebSocket(debuggermode ? 'ws://127.0.0.1:9099' : 'ws://119.29.104.68:9099');
layer.msg('正在连接服务器..', {
    icon: 16,
    shade: 0.01,
    time: 1000000
});
ws.onopen = function () {
    layer.closeAll();
    layer.msg('连接服务器成功', {
        icon: 1
    });

    $('.denglu').click(function () {
        ws.send(JSON.stringify({
            Head: 'login',
            Data: {
                UserName: $('.login .username').val(),
                Password: $('.login .password').val()
            }
        }));
    })

    $('.zhuce').click(function () {
        ws.send(JSON.stringify({
            Head: 'regist',
            Data: {
                UserName: $('.regist .username').val(),
                Password: $('.regist .password').val(),
                NickName: $('.regist .nickname').val()
            }
        }));
    })
};
ws.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    console.log(data);
    // 被强制断开连接
    if (data.Head === 'close') {
        // layer.alert(data.Message, {
        //     icon: 6
        // });
        var msg = layer.alert(data.Message, {
            closeBtn: 0
        }, function () {
            location.reload()
        });
    }
    // 注册
    if (data.Head === 'regist') {
        layer.alert(data.Message, {
            icon: 6
        });
    }
    // 登录
    if (data.Head === 'login') {
        if (data.Status === 200) {
            $('.login,.regist').hide();
            $('.room,.mymsg,.creatroom').show();
            getRoom();
            $('.mymsg11').text(`姓名:${data.Data.UserMsg.NickName} 性别:${data.Data.UserMsg.Gender} `)
            $('.mymsg12').html(`
    总场次:<span style="color:red;">${data.Data.SceneMsg.Scene}&nbsp;&nbsp;</span>
    赢的场次:<span style="color:red;">${data.Data.SceneMsg.WinScene}&nbsp;&nbsp;</span>
    输的场次:<span style="color:red;">${data.Data.SceneMsg.FailScene}&nbsp;&nbsp;</span>
    初级场次:<span style="color:red;">${data.Data.SceneMsg.LevelOne}&nbsp;&nbsp;</span>
    中级场次:<span style="color:red;">${data.Data.SceneMsg.LevelTwo}&nbsp;&nbsp;</span>
    高级场次:<span style="color:red;">${data.Data.SceneMsg.LevelThree}&nbsp;&nbsp;</span>
    赢的初级场次:<span style="color:red;">${data.Data.SceneMsg.LevelOneWin}&nbsp;&nbsp;</span>
    赢的中级场次:<span style="color:red;">${data.Data.SceneMsg.LevelTwoWin}&nbsp;&nbsp;</span>
    赢的高级场次:<span style="color:red;">${data.Data.SceneMsg.LevelThreeWin}&nbsp;&nbsp;</span>
    初级最快时间:<span style="color:red;">${data.Data.SceneMsg.MaxTimeOne / 1000}秒&nbsp;&nbsp;</span>
    中级最快时间:<span style="color:red;">${data.Data.SceneMsg.MaxTimeTwo / 1000}秒&nbsp;&nbsp;</span>
    高级最快时间:<span style="color:red;">${data.Data.SceneMsg.MaxTimeThree / 1000}秒&nbsp;&nbsp;</span>
    `)
        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }

    }
    // 更新数据
    if (data.Head === 'updateMsg') {
        if (data.Status === 200) {
            $('.mymsg12').html(`
    总场次:<span style="color:red;">${data.Data.Scene}&nbsp;&nbsp;</span>
    赢的场次:<span style="color:red;">${data.Data.WinScene}&nbsp;&nbsp;</span>
    输的场次:<span style="color:red;">${data.Data.FailScene}&nbsp;&nbsp;</span>
    初级场次:<span style="color:red;">${data.Data.LevelOne}&nbsp;&nbsp;</span>
    中级场次:<span style="color:red;">${data.Data.LevelTwo}&nbsp;&nbsp;</span>
    高级场次:<span style="color:red;">${data.Data.LevelThree}&nbsp;&nbsp;</span>
    赢的初级场次:<span style="color:red;">${data.Data.LevelOneWin}&nbsp;&nbsp;</span>
    赢的中级场次:<span style="color:red;">${data.Data.LevelTwoWin}&nbsp;&nbsp;</span>
    赢的高级场次:<span style="color:red;">${data.Data.LevelThreeWin}&nbsp;&nbsp;</span>
    初级最快时间:<span style="color:red;">${data.Data.MaxTimeOne / 1000}秒&nbsp;&nbsp;</span>
    中级最快时间:<span style="color:red;">${data.Data.MaxTimeTwo / 1000}秒&nbsp;&nbsp;</span>
    高级最快时间:<span style="color:red;">${data.Data.MaxTimeThree / 1000}秒&nbsp;&nbsp;</span>
    `)
        }

    }
    // 得到房间
    if (data.Head === 'getRoom') {
        if (data.Status === 200) {
            $('.roomlist').html('');
            data.Data.list.forEach(item => {
                $('.roomlist').append(
                    `<option value="${item.Id}">${item.Name}-${item.nowNumber}/${item.Number}-${[null, "初级", "中级", "高级", "自定义"][item.Mode.Type]}</option>`
                )
            });

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 新的房间
    if (data.Head === 'newRoom') {
        if (data.Status === 200) {
            var item = data.Data;
            $('.roomlist').prepend(
                `<option value="${item.Id}">${item.Name}-${item.nowNumber}/${item.Number}-${[null, "初级", "中级", "高级", "自定义"][item.Mode.Type]}</option>`
            )
        }
    }
    // 销毁房间
    if (data.Head === 'destoryRoom') {
        if (data.Status === 200) {
            var item = data.Data.id;
            $('.roomlist').find(`option[value="${item}"]`).remove();
        }
    }
    // 创建房间
    if (data.Head === 'createRoom') {
        if (data.Status === 200) {

            $('.roomname').html(`
    名称:<span style="color:red;">${data.Data.Name}</span>
    对局时间:<span style="color:red;">${data.Data.Time}</span>
    房主:<span style="color:red;">${data.Data.owner}</span>
    当前玩家人数:<span style="color:red;">${data.Data.player.length}</span>
    `);

            $('.fjwj').html('');

            data.Data.player.forEach(item => {
                $('.fjwj').append(
                    `<option value="${item.message.UserMsg.NickName}">${item.message.UserMsg.NickName}(未准备)</option>`
                )
            });

            $('.room,.creatroom').hide();
            $('.nowRoom').show();


        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 加入房间
    if (data.Head === 'addRoom') {
        if (data.Status === 200) {

            $('.roomname').html(`
    名称:<span style="color:red;">${data.Data.Name}</span>
    对局时间:<span style="color:red;">${data.Data.Time}</span>
    房主:<span style="color:red;">${data.Data.owner}</span>
    当前玩家人数:<span style="color:red;">${data.Data.player.length}</span>
    `);

            $('.fjwj').html('');

            data.Data.player.forEach(item => {
                $('.fjwj').append(
                    `<option value="${item.message.UserMsg.NickName}">${item.message.UserMsg.NickName}${item.Status == 0 ?
                        '(未准备)' : '(已准备)'}</option>`
                )
            });

            $('.room,.creatroom').hide();
            $('.nowRoom').show();

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 其他用户加入
    if (data.Head === 'otherAdd') {
        if (data.Status === 200) {
            var num = parseInt($('.roomname').find('span').eq(3).text()) + 1
            $('.roomname').find('span').eq(3).text(num)

            $('.fjwj').append(
                `<option value="${data.Data.player.message.UserMsg.NickName}">
        ${data.Data.player.message.UserMsg.NickName}(未准备)</option>`
            )

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 其他用户离开
    if (data.Head === 'otherLeaveRoom') {
        if (data.Status === 200) {
            var num = parseInt($('.roomname').find('span').eq(3).text()) - 1
            $('.roomname').find('span').eq(3).text(num)
            $('.roomname').find('span').eq(2).text(data.Data.newOwner)

            $('.fjwj').find(`option[value="${data.Data.NickName}"]`).remove();

            $(`[name="${data.Data.NickName}"]`).remove();
        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 玩家准备
    if (data.Head === 'ready' || data.Head === 'offReady') {
        if (data.Status === 200) {

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 玩家准备
    if (data.Head === 'playerReady') {
        if (data.Status === 200) {

            $('.fjwj').find(`option[value="${data.Data.NickName}"]`).text(`${data.Data.NickName}(已准备)`);

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 玩家取消准备
    if (data.Head === 'playerOffReady') {
        if (data.Status === 200) {

            $('.fjwj').find(`option[value="${data.Data.NickName}"]`).text(`${data.Data.NickName}(未准备)`);

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 退出房间
    if (data.Head === 'leaveRoom') {
        if (data.Status === 200) {

            $('.roomname,.fjwj').html('');
            $('.room,.creatroom').show();
            $('.nowRoom').hide();
            getRoom();

        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 开始游戏
    if (data.Head === 'start') {
        if (data.Status === 200) {
            creatGame(data.Data);
        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 开始游戏
    if (data.Head === 'startGame') {
        if (data.Status === 200) {
            creatGame(data.Data);
        } else {
            layer.alert(data.Message, {
                icon: 6
            });
        }
    }
    // 显示雷
    if (data.Head === 'showPosition') {
        if (data.Status === 200) {
            var n = $(`[name="${data.Data.NickName}"]`).find(`[data-x="${data.Data.x}"][data-y="${data.Data.y}"]`);
            n.css('background-color', '#fff');
            if (data.Data.num != 0) {
                n.text(data.Data.num);
            }
        }
    }
    // 标记雷
    if (data.Head === 'setMarkPosition') {
        if (data.Status === 200) {
            var n = $(`[name="${data.Data.NickName}"]`).find(`[data-x="${data.Data.x}"][data-y="${data.Data.y}"]`);
            $(`[name="${data.Data.NickName}"]`).find('.syls').text('剩余雷:' + data.Data.markNum)
            if (data.Data.status) {
                n.html('<span style="color:#FFF">旗</span>')
            } else {
                n.find('span').remove();
            }
        }
    }
    // 某玩家对局完成
    if (data.Head === 'gameOver') {
        if (data.Status === 200) {
            if (!data.Data.win) {
                $(`[name="${data.Data.NickName}"]`).find(`.syls`).text(`已完成对局,${data.Data.win ? '赢了' : '输了'}`);

                for (var i = 0; i < data.Data.area.length; i++) {
                    for (var v = 0; v < data.Data.area[i].length; v++) {
                        if (data.Data.area[i][v] == -1) {
                            $(`[name="${data.Data.NickName}"]`).find(`.lattice[data-x="${v}"][data-y="${i}"]`).css('background-color', 'red');
                        } else {

                            $(`[name="${data.Data.NickName}"]`)
                                .find(`.lattice[data-x="${v}"][data-y="${i}"]`)
                                .css('background-color', '#fff')
                                .text(data.Data.area[i][v] != 0 ? data.Data.area[i][v] : '');

                        }

                    }
                }
            }
            layer.open({
                type: 1,
                offset: '0px' //具体配置参考：offset参数项
                    ,
                content: `<div style="padding: 20px 80px;">玩家${data.Data.NickName}${data.Data.win ? '已经完成了对局' : '失败了'}</div>`,
                btn: '关闭',
                btnAlign: 'c' //按钮居中
                    ,
                shade: 0 //不显示遮罩
                    ,
                time: 2000,
                yes: function () {
                    layer.closeAll();
                }
            });

        }
    }
    // 整局对局完成
    if (data.Head === 'completeGame') {
        if (data.Status === 200) {
            var html = '';
            var win = data.Data.sort.filter(item => item.win);
            var fail = data.Data.sort.filter(item => !item.win);

            win.forEach((item, index) => {
                html += `第${index + 1}名<span style="color:red;">${item.NickName}</span> 用时:<span style="color:red;">${item.Time}秒</span><br>`
            })

            fail.forEach((item, index) => {
                html += `第${index + 1 + win.length}名<span style="color:#red;">${item.NickName}</span> 用时:<span style="color:#888484;">${item.Time === 10000 ? '未完成' : item.Time + '秒'}</span> (失败)<br>`
            })

            var msg = layer.alert(html, {
                closeBtn: 0
            }, function () {
                $('.nowRoom').show();
                $('.djxxbox,.gamearea').hide();
                $('.djxx,.gamearea,.djxxsysj').html('')
                clearInterval(timeer);

                $('.fjwj').find('option').each(function (index, item) {
                    var $item = $(item);
                    $item.text($item.text().replace('已准备', '未准备'))
                })

                layer.close(msg);
            });


        }
    }
};
var timeer;
// 创建游戏
function creatGame(data) {
    $('.nowRoom').hide();
    $('.djxxbox,.gamearea').show();
    $('.djxx').html(`
    模式:<span style="color:red;">${[null, '初级', '中级', '高级', '自定义'][data.mode.Type]}&nbsp;&nbsp;</span>
    高宽:<span style="color:red;">${data.mode.Height}*${data.mode.Width}&nbsp;&nbsp;</span>
    总雷数:<span style="color:red;">${data.mode.MineNum}&nbsp;&nbsp;</span>
    玩家数:<span style="color:red;">${data.player.length}&nbsp;&nbsp;</span>
    总时间:<span style="color:red;">${data.time * 60}秒&nbsp;&nbsp;</span>
    `);

    var time = data.time * 60;

    var sysj = $('.djxxsysj');
    sysj.text('剩余时间:' + time + '秒');
    timeer = setInterval(function () {
        sysj.text('剩余时间:' + time + '秒');
        time--;
        if (time === 0) {
            clearInterval(timeer);
        }
    }, 1000)

    var gamearea = $('.gamearea');
    // 创建自己的区域
    gamearea.append(`<fieldset name="${data.NickName}" style="display: inline-block;">
        <legend>${data.NickName}</legend>
        <button onclick="exitThisGame()">退出该局游戏</button>
        <div class="syls">剩余雷:${data.mode.MineNum}</div>
        <div class="box qy-myself" style="width:${data.mode.Width * 32}px;height:${data.mode.Height * 32}px;"></div>
        </fieldset>`);
    // 创建其他人的区域
    for (var i = 0; i < data.player.length; i++) {
        gamearea.append(`<fieldset name="${data.player[i]}" style="display: inline-block;">
            <legend>${data.player[i]}</legend>
            <div class="syls">剩余雷:${data.mode.MineNum}</div>
            <div class="box qy-other" style="width:${data.mode.Width * 16}px;height:${data.mode.Height * 16}px;"></div>
            </fieldset>`);
    }

    // 创建区域块
    var size = data.mode.Width * data.mode.Height;
    var box = gamearea.find('.box');
    for (var i = 0; i < size; i++) {
        var x = i % data.mode.Width;
        var y = (i - x) / data.mode.Width
        box.append(`<div class="lattice" data-x="${x}" data-y="${y}"></div>`);
    }
    var myself = $('.qy-myself');
    // 按键按下
    myself.on('mousedown', '.lattice', function (e) {
        var item = $(this);
        var data = item.data();
        var x = data.x;
        var y = data.y;

        // 中键
        if (e.which == 2) {
            myself.find(`.lattice[data-x="${x - 1}"][data-y="${y - 1}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x - 1}"][data-y="${y}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x - 1}"][data-y="${y + 1}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x}"][data-y="${y - 1}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x}"][data-y="${y + 1}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x + 1}"][data-y="${y + 1}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x + 1}"][data-y="${y}"]`).addClass('middle');
            myself.find(`.lattice[data-x="${x + 1}"][data-y="${y - 1}"]`).addClass('middle');
        }
    })

    // 按键弹起
    myself.on('mouseup', '.lattice', function (e) {
        var item = $(this);
        var data = item.data();
        var x = data.x;
        var y = data.y;

        // 左键
        if (e.which == 1) {
            ws.send(JSON.stringify({
                Head: 'click',
                Data: {
                    x: x,
                    y: y
                }
            }))
        }
        // 右键
        if (e.which == 3) {
            ws.send(JSON.stringify({
                Head: 'setMark',
                Data: {
                    x: x,
                    y: y
                }
            }))
        }
        // 中键
        if (e.which == 2) {
            myself.find('.lattice').removeClass('middle');
            ws.send(JSON.stringify({
                Head: 'middle',
                Data: {
                    x: x,
                    y: y
                }
            }))
        }
    })

}

// 获取房间
function getRoom() {
    ws.send(JSON.stringify({
        Head: 'getRoom',
        Data: {
            page: 1,
            pageSize: 1000
        }
    }));
}

// 创建房间
function creatRoom() {
    ws.send(JSON.stringify({
        Head: 'createRoom',
        Data: {
            Name: $('.fjm').val(),
            Password: $('.fjmm').val(),
            Number: $('.zdrs').val(),
            Mode: parseInt($('.ms').val()),
            Time: $('.djsj').val()
        }
    }));
}
// 加入房间
function addRoom() {
    ws.send(JSON.stringify({
        Head: 'addRoom',
        Data: {
            id: $('.roomlist').val()[0],
            Password: $('.jrfjmm').val(),
        }
    }));
}
// 准备
function zhunbei() {
    ws.send(JSON.stringify({
        Head: 'ready',
        Data: {}
    }));
}
// 取消准备
function qxzhunbei() {
    ws.send(JSON.stringify({
        Head: 'offReady',
        Data: {}
    }));
}
// 退出房间
function tcRoom() {
    ws.send(JSON.stringify({
        Head: 'leaveRoom',
        Data: {}
    }));
}
// 开始游戏
function startGame() {
    ws.send(JSON.stringify({
        Head: 'start',
        Data: {}
    }));
}
// 离开房间
function exitThisGame() {
    $('.djxxbox,.gamearea').hide();
    $('.djxx,.gamearea,.djxxsysj').html('')
    clearInterval(timeer);
    tcRoom();
}