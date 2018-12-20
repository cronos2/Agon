const winston = require('winston');
const { Papertrail } = require('winston-papertrail');


winston.configure({
    'level': 'debug',
    'format': winston.format.simple(),
    'transports': [
        new winston.transports.Console(),
        new winston.transports.File({
            'filename': 'agon.log'
        }),
        new Papertrail({
            'host': process.env.PAPERTRAIL_HOST,
            'level': 'debug',
            'port': process.env.PAPERTRAIL_PORT,
            'program': 'agon'
        })
    ]
});
