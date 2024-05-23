/************************************************************************
 *                           CONSTANTS MODULE                           *
 *                                                                      *
 * This module contains all the constants used by this API. Some are    *
 * only used internally and some are also sent to external clients in   *
 * responses. Most of the constants are functionally enums, although a  *
 * few are also used as bitmasks for easier condensation of data.       *
 ************************************************************************/

/**********************
 * Internal constants *
 **********************/

// Role is a bitmask for internal permissioning which determines what actions a user should
// or shouldn't have access to. The challenger and leader roles should always be mutually
// exclusive, but any user can be an admin.
export const role = {
    challenger: 1,
    leader: 2,
    admin: 4
};

// Battle status is a constant used to track whether a battle is in queue, on hold, or recorded
// as complete, allowing us to track match history and queue state all in a single db table. The
// loss and win values are from a challenger perspective and should be inverted when determining
// battle stats for a leader (i.e. win is a leader loss, loss is a leader win).
export const battleStatus = {
    inQueue: 0,
    onHold: 1,
    loss: 2, // Challenger loss
    win: 3,  // Challenger win
    ash: 4,  // Challenger loss but badge awarded
    gary: 5  // Challenger win but no badge awarded because the challenger was a complete prick
};

// Battle data format is a constant that's passed into the API as a string (one of the ones
// declared below) for determining what format the requester wants the response to be in.
export const battleDataFormat = {
    queue: 0,
    history: 1,
    stats: 2
};

// Queue status is a representation of a leader's queue status (open or closed) as we store it
// in the db. Having it as a constant is probably overkill, but it improves code readability.
export const queueStatus = {
    closed: 0,
    open: 1
};

/********************
 * Public constants *
 ********************/

// Result codes are used internally to indicate whether a db operation failed and presented
// to requesting clients alongside a user-friendly error message for non-200 responses. For
// details on the error messages, see the errors.js module.
export const resultCode = {
    success: 0,
    dbFailure: 1,
    insufficientPermissions: 2,
    usernameTooShort: 3,
    usernameTooLong: 4,
    passwordTooShort: 5,
    usernameTaken: 6,
    registrationFailure: 7,
    badCredentials: 8,
    invalidToken: 9,
    notFound: 10,
    alreadyInQueue: 11,
    alreadyWon: 12,
    queueIsFull: 13,
    tooManyChallenges: 14,
    notInQueue: 15,
    queueIsClosed: 16,
    notEnoughBadges: 17,
    notEnoughEmblems: 18,
    unsupportedDifficulty: 19,
    unsupportedFormat: 20,
    queueAlreadyOpen: 21,
    queueAlreadyClosed: 22,
    queueStateNotSupported: 23
};

// Battle difficulty is a bitmask that's used to represent what battle difficulties a
// leader supports (used as a mask) and the difficulty of each individual battle (used
// as a constant). NOTE: The elite and champion difficulties should generally never
// be masked with other values, as they're special leader/battle types.
export const battleDifficulty = {
    casual: 1,
    intermediate: 2,
    veteran: 4,
    elite: 8,
    champion: 16
};

// Battle format is a bitmask that's used to represent what battle formats a leader
// supports (used as a mask) and the format of each individual battle (used as a
// constant). The special value is used for any non-standard battle format (e.g. a quiz,
// a minigame, or a battle in an offshoot game like Colosseum).
export const battleFormat = {
    singles: 1,
    doubles: 2,
    multi: 4,
    special: 8
};

// HTTP status is a small subset of the available status codes, only containing the values
// that this API uses.
export const httpStatus = {
    ok: 200,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    serverError: 500
};

// Websocket actions are both sent and received by the API as part of the websocket framework
// for automatic page reloads/data updates. For more detail, see the websockets.js module.
export const websocketAction = {
    authenticate: 0,
    confirm: 1,
    refreshData: 2,
    refreshBingo: 3
};
