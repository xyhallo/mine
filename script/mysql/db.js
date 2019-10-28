/**
 * 模块 : sqlDB
 */
const Sequelize = require('sequelize');

const sequelize = new Sequelize('mine', 'root', 'root', {
    host: '127.0.0.1',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: false
});

sequelize
    .authenticate()
    .then(() => {
        console.log('--------------数据库连接成功');
    })
    .catch(err => {
        console.error('--------------数据库连接失败');
    });


sequelize.Types = Sequelize.DataTypes;
sequelize.Op = Sequelize.Op;

module.exports = sequelize;