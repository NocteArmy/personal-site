const bunyan = require('bunyan');

const appname = 'Author or Site Name';

module.exports = {
    applicationName: appname,
    logger: bunyan.createLogger({ name: appname })
}