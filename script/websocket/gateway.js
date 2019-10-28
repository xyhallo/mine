/**
 * 模块 : 网关
 */

// 信息返回模块
const module_console = require('../modules/console/index');

function monitor(ws) {
    this.ws = ws;
    this.num = 0;
    this.close = false;
    this.reset();
}

monitor.prototype.request = function (callback) {

    if (!this.close) {

        this.num++;

        // console.log(this.num)

        if (this.num > 20) {
            this.close = true;
            this.ws.send(JSON.stringify({
                Head: 'close',
                Data: {},
                Message: '你被强制断开了连接',
                Status: 500
            }));

            console.log('强制断开用户:', this.ws.status.user.UserName, '原因：', `请求次数过多(${this.num})`)

            setTimeout(() => {
                this.ws.close()
            }, 500)

            return;
        };

        callback();

    }

}

monitor.prototype.reset = function () {
    this.timeer = setInterval(() => {
        this.num > 0 ? this.num-=10 : '';
        if (this.close) {
            clearInterval(this.timeer);
        }
    }, 1200);
}



console.log('--------------网关模块初始完成');
module.exports = monitor;