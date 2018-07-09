const bunyan = require('bunyan');

const appname = 'Author or Site Name';

module.exports = {
    applicationName: appname,
    logger: bunyan.createLogger({ name: appname }),
    mail : {
        options: {
            service: 'SendinBlue',
            requireTLS: true,
            auth: {
                user: 'username',
                pass: 'password'
            }
        }
    },
    postgres: {
        options: {
            host: 'localhost',
            port: 5432,
            database: 'db_name',
            dialect: 'postgres',
            username: 'username',
            password: 'db_password',
            pool: {
                max: 5,
                idle: 30000,
                acquire: 60000
            },
            operatorsAliases: false,
            logging: false
        }
    }
}