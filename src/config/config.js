/************************************************************************
 *                            CONFIG MODULE                             *
 *                                                                      *
 * This module selects and loads a config file for use by the API based *
 * on a provided environment variable, allowing for different configs   *
 * to be easily maintained and used for different PPL events, as well   *
 * as for the test suites. If no variable is specified, the general     *
 * config file will be used, and if an invalid one is specified, the    *
 * API will fail to initialize entirely. Valid values are:              *
 *   general, east, west, aus, online, test                             *
 *                                                                      *
 * For more detail on the configs and what each values means, check the *
 * README for this directory.                                           *
 ************************************************************************/
import ausConfig from './event/aus.js';
import eastConfig from './event/east.js';
import generalConfig from './general.js';
import logger from '../util/logger.js';
import onlineConfig from './event/online.js';
import testConfig from './event/test.js';
import westConfig from './event/west.js';

const pplEvent = process.env.PPL_EVENT || 'general';
let config;
switch (pplEvent) {
    case 'general':
        config = { ...generalConfig };
        break;
    case 'east':
        config = { ...generalConfig, ...eastConfig };
        break;
    case 'west':
        config = { ...generalConfig, ...westConfig };
        break;
    case 'aus':
        config = { ...generalConfig, ...ausConfig };
        break;
    case 'online':
        config = { ...generalConfig, ...onlineConfig };
        break;
    case 'test':
        config = { ...generalConfig, ...testConfig };
        break;
    default:
        logger.error(`PPL_EVENT=${pplEvent} is an invalid value, aborting startup`);
        process.exit(0);
}

logger.info(`Configs initialized with PPL_EVENT=${pplEvent}`);
export default config;
