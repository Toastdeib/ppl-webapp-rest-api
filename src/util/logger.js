/************************************************************************
 *                            LOGGING MODULE                            *
 *                                                                      *
 * This module defines a logger for use by all other modules in the     *
 * project. It uses the winston log library to format and write         *
 * messages to a rotating log file with 14-day expiration. It also      *
 * supports a special logging mode for the test suites which prints log *
 * messages to the console with color formatting for clarity, so as to  *
 * avoid clogging the real logs with dummy data. The special logging    *
 * mode will only be used if the TEST_RUN environment variable is set   *
 * to true.                                                             *
 *                                                                      *
 * This module exports an object containing the following functions:    *
 *   debug, info, warn, error                                           *
 ************************************************************************/
import { MESSAGE } from 'triple-beam';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

// TODO - Import configs, pull the log root from there
const logRoot = '.';

const TIMESTAMP_START = 11;
const TIMESTAMP_LENGTH = 8;

class ColorConsole extends transports.Console {
    constructor(options) {
        super(options);
    }

    log(info, callback) {
        const re = /([a-z0-9_]+)=([a-z0-9_]+)/gi;
        info[MESSAGE] = info[MESSAGE].replaceAll(re, '\x1b[95m$1\x1b[0m=\x1b[91m$2\x1b[0m');
        super.log(info, callback);
    }
}

function getColor(level) {
    switch (level) {
        case 'debug':
            return '\x1b[36m';
        case 'info':
            return '\x1b[32m';
        case 'warn':
            return '\x1b[33m';
        case 'error':
            return '\x1b[31m';
    }
}

const consoleFormatter = format((info) => {
    info[MESSAGE] = `[${info.timestamp.substr(TIMESTAMP_START, TIMESTAMP_LENGTH)}] ${getColor(info.level)}${info.level}\x1b[0m: ${info.message}`;
    return info;
});

function dDebug(msg) {
    console.log(`\x1b[36mD>\x1b[0m ${msg}`);
}

function dInfo(msg) {
    console.log(`\x1b[32mI>\x1b[0m ${msg}`);
}

function dWarn(msg) {
    console.log(`\x1b[33mW>\x1b[0m ${msg}`);
}

function dError(msg) {
    console.log(`\x1b[31mE>\x1b[0m ${msg}`);
}

let logger;
if (process.env.TEST_RUN === 'true') {
    logger = {
        debug: dDebug,
        info: dInfo,
        warn: dWarn,
        error: dError
    };
} else {
    logger = createLogger({
        level: 'debug',
        format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
        transports: [
            new transports.DailyRotateFile({ filename: `${logRoot}/logs/error-%DATE%.log`, level: 'error', maxFiles: '14d' }),
            new transports.DailyRotateFile({ filename: `${logRoot}/logs/combined-%DATE%.log`, level: 'info', maxFiles: '14d' }),
            new ColorConsole({ format: consoleFormatter() })
        ]
    });
}

export default logger;
