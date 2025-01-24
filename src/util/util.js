/************************************************************************
 *                             UTILS MODULE                             *
 *                                                                      *
 * This module defines several general-purpose utility functions which  *
 * are used by other modules in the API.                                *
 *                                                                      *
 * This module exports the following functions:                         *
 *   generateHex                                                        *
 ************************************************************************/
import crypto from 'crypto';

/***************
 * Public APIs *
 ***************/
export function generateHex(length) {
    return crypto.randomBytes(length).toString('hex');
}
