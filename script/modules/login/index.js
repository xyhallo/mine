/**
 * 模块 : 登录/注册
 */

// 数据库操作模块
const sequelize = require('../../mysql/db');
// 信息返回模块
const module_console = require('../console/index');

// 定义数据模型
const UserModel = sequelize.define('user', {
    Id: {
        type: sequelize.Types.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    UserName: sequelize.Types.STRING,
    Password: sequelize.Types.STRING,
    NickName: sequelize.Types.STRING,
    Email: sequelize.Types.STRING,
    Phone: sequelize.Types.STRING,
    Gender: sequelize.Types.STRING,
    CreateTime: sequelize.Types.DATE,
    LastIp: sequelize.Types.STRING,
}, {
    tableName: "user",
    freezeTableName: true,
    timestamps: false
})

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

var event = {};

/**
 * 登录 <head:login>
 * 参数:
 * 账号 ---- UserName <必填>
 * 密码 ---- Password <必填>
 */
event.login = async (data, ws, callback) => {

    // 验证传参数据
    try {
        if (data.UserName.length < 6) return module_console.error('登录失败,账号最少6位', 'login', {}, callback);
        if (data.Password.length < 6) return module_console.error('登录失败,密码最少6位', 'login', {}, callback);
    } catch (error) {
        return module_console.error('用户数据格式错误', 'login', {}, callback);
    }

    // 是否已登录
    if (data.UserName in global.UserList) return module_console.error('登录失败,用户已登录', 'login', {}, callback);

    // 账号密码是否正确
    const someUser = await UserModel.findAll({
        where: {
            UserName: data.UserName,
            Password: data.Password
        }
    })

    if (someUser.length === 1) {

        const SceneMsg = await SceneModel.findAll({
            where: {
                UserId: someUser[0]['Id']
            }
        })

        if (SceneMsg.length === 1) {
            ws.status.isLogin = true;
            ws.status.user = someUser[0];
            ws.status.scene = SceneMsg[0];
            ws.status.status = 1;
            // ws.status = {
            //     isLogin: true,
            //     user: someUser[0],
            //     scene: SceneMsg[0],
            //     status: 1
            // };

            global.UserList[someUser[0]['UserName']] = ws;

            return module_console.info('登录成功', 'login', {
                UserMsg: {
                    NickName: someUser[0]["NickName"],
                    Gender: ['未知', '男', '女'][someUser[0]["Gender"]] || '未知',
                    LastIp: someUser[0]["LastIp"],
                },
                SceneMsg: SceneMsg[0]
            }, callback);
        }
    }
    return module_console.error('登录失败,账号或密码错误', 'login', {}, callback);
}

/**
 * 注册 <head:regist>
 * 参数:
 * 账号 ---- UserName <必填>
 * 密码 ---- Password <必填>
 * 名称 ---- NickName <必填>
 * 邮箱 ---- Email
 * 电话 ---- Phone
 * 性别 ---- Gender <1-男, 2-女>
 */
event.regist = async (data, callback) => {

    // console.log('准备注册', data)
    try {
        if (data.UserName.length < 6) return module_console.error('注册失败,账号最少6位', 'regist', {}, callback);
        if (data.Password.length < 6) return module_console.error('注册失败,密码最少6位', 'regist', {}, callback);
        if (data.NickName.length < 1) return module_console.error('注册失败,请输入名称', 'regist', {}, callback);
        if ('Email' in data && data.Email !== '' && !(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(data.Email))) return module_console.error('注册失败,邮箱格式错误', 'regist', {}, callback);
        if ('Phone' in data && data.Phone !== '' && !(/^1[3456789]\d{9}$/.test(data.Phone))) return module_console.error('注册失败,手机号格式错误', 'regist', {}, callback);
        if ('Gender' in data && data.Gender !== '' && !(data.Gender == 1 || data.Gender == 2)) return module_console.error('注册失败,性别错误', 'regist', {}, callback);
        data.Email = data.Email || null;
        data.Phone = data.Phone || null;
        data.Gender = data.Gender || null;
    } catch (error) {
        return module_console.error('用户数据格式错误', 'regist', {}, callback);
    }

    // 是否重复账号
    const someUser = await UserModel.findAll({
        where: {
            UserName: {
                [sequelize.Op.or]: [data.UserName]
            },
            NickName: {
                [sequelize.Op.or]: [data.NickName]
            }
        }
    })

    if (someUser.length !== 0) return module_console.error('注册失败,账号或用户名重复!', 'regist', {}, callback);

    return sequelize.transaction(function (t) {

        // 要确保所有的查询链都有return返回
        return UserModel.create({
                ...data,
                CreateTime: new Date(),
                LastIp: ''
            }, {
                transaction: t
            })
            .then(function (user) {
                // console.log(user)

                return SceneModel.create({
                    UserId: user.dataValues.Id
                }, {
                    transaction: t
                });
            });

    }).then(function (result) {
        // Transaction 会自动提交
        // result 是事务回调中使用promise链中执行结果
        module_console.info('注册成功', 'regist', {}, callback);

    }).catch(function (err) {
        // Transaction 会自动回滚
        // err 是事务回调中使用promise链中的异常结果
        module_console.error('注册失败,服务器错误', 'regist', {}, callback);
    });

    // 开始注册
    // UserModel.create({
    //     ...data,
    //     CreateTime: new Date(),
    //     LastIp: ''
    // }).then(res => {
    //     module_console.info('注册成功', 'regist', {}, callback);
    // }).catch(err => {
    //     module_console.error('注册失败,服务器错误', 'regist', {}, callback);
    // })



}

console.log('--------------登录/注册模块初始完成');

module.exports = event;