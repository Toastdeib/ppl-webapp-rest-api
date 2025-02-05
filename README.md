# PPL Webapp API v3

## Table of Contents

- [A Brief Overview of the PPL](#overview)
- [Glossary](#glossary)
- [Domain Model](#domain-model)
- [Database Structure](#database-structure)
- [API Documentation](#api-documentation)
    - [Notes](#notes)
    - [Custom Headers](#custom-headers)
    - [Authentication APIs](#authentication-apis)
    - [Challenger APIs](#challenger-apis)
    - [Leader APIs](#leader-apis)
    - [Battle APIs](#battle-apis)
    - [Reporting APIs](#reporting-apis)
    - [Other APIs](#other-apis)
- [Constants](#constants)
- [Websockets](#websockets)

# Overview

The [PAX Pokémon League](https://www.paxpokemonleague.net) (PPL) webapp is a system for helping with queue management and tracking battle statistics for PPL events, as well as presenting various pieces of event information to league challengers and helping to coordinate one of our side activities. The major pieces of functionality are:

- **Queuing**: Gym leaders can view and manage the challengers waiting in line to battle them, and challengers can view what queues they're in and do limited queue management themselves.
- **Battle results**: Gym leaders can record the results of a battle and whether they awarded the challenger a badge as two separate datapoints, allowing for accurate tracking of win/loss rates and badge counts.
- **Event info**: All users can use the webapp to view various details about the PPL event, including a guide on how to challenge the league, meetup times/locations, rules, prizes, etc.
- **Signature Bingo**: Challengers can participate in a side activity wherein they attempt to fill in a line on a randomly-generated bingo board (created when they register or log in for the first time for a new event) by battling the leaders whose signature Pokémon appear on the board. Squares on the board are filled in after a battle result is recorded, regardless of whether or not a badge was earned.

[Back to top](#table-of-contents)

# Glossary

- **Challenger**: A PAX attendee who chooses to challenge the PPL by battling gym leaders and earning their badges.
- **Gym leader**: A member of the PPL who challengers can battle to earn a badge. Often shorthanded simply as "leader".
- **Elite**: A gym leader who can only be battled by challengers who have earned a specified number of badges from regular gym leaders (usually 8, but it can be higher or lower depending on how many gym leaders an event has).
- **Champion**: The gym leader at the end of the league, who can only be battled by challengers who have earned a specified number of badges and/or emblems.
- **Badge**: A small pin that indicates a challenger has beaten (or at least put up a good show against) a gym leader.
- **Emblem**: A badge awarded by one of the elites.
- **Battle**: A contest between a challenger and a gym leader. In most cases, this will be an actual battle held with the latest generation Pokémon games, but the term **also** encompasses non-battle formats, such as quizzes, minigames, or whatever else a gym leader may offer as a way for a challenger to earn their badge.

[Back to top](#table-of-contents)

# Domain Model

## Account

A representation of a user account, with the following properties:

- **ID**: An ID for the account which gets generated when the account is created. Account IDs are 6-byte hex strings (12 characters) and are guaranteed to be unique.
- **Username**: The name used to log into the system. Usernames **must** be between 4 and 30 characters, and may **only** consist of alphanumeric characters and underscores. Usernames are guaranteed to be unique.
- **Password**: The password used in conjunction with the username for authentication. Passwords will be hashed with salt for database storage and have a minimum length of 6 with no character restrictions.
- **Permissions**: An array of permissions associated with the account. These will be represented internally by bitmask values defined by the [permission constant](#permission), and exposed to clients as boolean flags.

## Challenger

A representation of a PPL challenger, with the following properties:

- **ID**: An ID for the challenger which gets generated when the challenger is created. Challenger IDs are 8-byte hex strings (16 characters), are guaranteed to be unique, and have a one-to-one mapping to accounts.
- **Event:** The PPL event the challenger belongs to. When a user logs in, if a challenger does not exist for their ID on the current event, a new one will be created.
- **Account ID**: The ID of the account this challenger belongs to.
- **Display name**: The name that shows on the challenger's dashboard and in the challenger list when leaders are selecting someone to add to their queue. This property is customizable and will default to the associated account's username, but has fewer character restrictions. Display names are guaranteed to be unique.
- **Bingo board**: A 2D array representing the challenger's board for Signature Bingo.

## Leader

A representation of a PPL gym leader, with the following properties:

- **ID**: An ID for the leader. Leader IDs are 8-byte hex strings (16 characters), are guaranteed to be unique, and have a one-to-many mapping to accounts to support multi-battle leaders.
- **Event:** The PPL event the leader belongs to.
- **Account IDs**: An array of IDs of accounts this leader belongs to. This array will normally have a single entry, but it can have two for multi-battle leaders.
- **Leader name**: The leader's full name, including the epithet (e.g. "Leopold, the Masterful Magician"). This property is immutable and is used for display on the leader's dashboard and the trainer card.
- **Badge name**: The leader's badge name (e.g. "Illusion Emblem"). This property is immutable and is used for display on the leader's dashboard and the trainer card.
- **Bio**: The leader's biographical blurb (example omitted because they're long). This property is immutable and is used for display on the leader's dashboard and the trainer card.
- **Tagline**: The leader's badge tagline (e.g. "See through Leopold's trickery to earn the Illusion Emblem!"). This property is immutable and is used for display on the leader's dashboard and the trainer card.
- **Battle difficulties**: The battle difficulty tiers the leader supports, represented by the `battleDifficulty` bitmask defined by the [battleDifficulty constant](#battledifficulty). This can be a single value from the bitmask or a combination of multiple values.
- **Battle formats**: The battle formats the leader supports, represented by the `battleFormat` bitmask defined by the [battleFormat constant](#battleformat). This can be a single value from the bitmask or a combination of multiple values.
- **Battle code**: A custom battle code that can be defined by the leader. If a code is set, it will be used for **all** of the leader's battles; otherwise, the system will use the randomly generated codes from the battle objects.

## Battle

A representation of a battle between a leader and a challenger, with the following properties:

- **ID**: An ID for the battle which gets generated when the battle is created. Unlike account, challenger, and leader IDs, these are simple numeric values.
- **Event:** The PPL event the battle is from.
- **Challenger ID**: The ID of the challenger involved in the battle.
- **Leader ID**: The ID of the leader involved in the battle.
- **Battle difficulty**: The difficulty tier for the battle, represented by the `battleDifficulty` bitmask defined by the [battleDifficulty constant](#battledifficulty). This can only be a single value from the bitmask.
- **Battle format**: The format for the battle, represented by the `battleFormat` bitmask defined by the [battleFormat constant](#battleformat). This can only be a single value from the bitmask.
- **Battle status**: The current status of the battle, represented by the `battleStatus` constant defined by the [battleStatus constant](#battlestatus).
- **Queued at (UTC)**: The timestamp for when this battle was added to a queue (either created or returned from the `onHold` state), stored in UTC.
- **Recorded at (UTC)**: The timestamp for when a result was recorded for this battle, stored in UTC.
- **Battle code**: A randomly generated 8-digit numerical code associated with a battle that can be used as a link code in Pokémon Scarlet/Violet by the leader and challenger.

## Report

A representation of a report created by a leader about a challenger, with the following properties:

- **ID:** An ID for the report which gets generated when the report is submitted. Unlike account, challenger, and leader IDs, these are simple numeric values.
- **Event:** The PPL event the report is from.
- **Challenger ID**: The ID of the challenger that the report concerns.
- **Leader ID**: The ID of the leader filing the report.
- **Notes**: The notes the leader provided for additional context on why they're reporting the challenger. This field may be empty if the leader opts not to include additional context when filing a report.
- **Reported at (UTC)**: The timestamp for when the report was filed, stored in UTC.

## Event

A representation of a PPL event, with the following properties:

- **Event**: The specific PPL event; this can be one of 'East', 'West', and 'Aus' (and 'South', if PAX South ever returns).
- **Year**: The year for the PPL event, as a full 4-digit number (e.g. 2025).

**Note:** This object exists more conceptually than concretely, and won't be used in any API responses. In the database and in request headers, events will be represented as a single hyphenated string (e.g. East-2025) for simpler keying.

[Back to top](#table-of-contents)

# Database Structure

## ppl_webapp_accounts

Stores the data that backs the account object, with the following columns:

- **id**: VARCHAR(12), non-null, primary key
- **username**: VARCHAR(30), non-null, unique
- **password_hash**: VARCHAR(99), non-null
- **permissions**: TINYINT(4), non-null
- **registered_date_utc**: TIMESTAMP, non-null
- **last_used_date_utc**: TIMESTAMP, non-null
- **terminated_at_date_utc**: TIMESTAMP, nullable

## ppl_webapp_challengers

Stores the data that backs the challenger object, with the following columns:

- **id**: VARCHAR(16), non-null
- **ppl_event**: VARCHAR(15), non-null
- **account_id**: VARCHAR(12), non-null, foreign key
- **display_name**: VARCHAR(40), non-null

**Constraints:**

- **PK_Challenger**: PRIMARY KEY (id, ppl_event)
- **UC_Name**: UNIQUE (display_name, ppl_event)

## ppl_webapp_bingo_boards

Stores the data that backs boards for Signature Bingo, with the following columns:

- **challenger_id**: VARCHAR(16), non-null
- **leader_id**: VARCHAR(16), non-null
- **ppl_event**: VARCHAR(15), non-null
- **board_row**: TINYINT(4), non-null
- **board_column**: TINYINT(4), non-null

## ppl_webapp_leaders

Stores the data that backs the leader object, with the following columns:

- **id**: VARCHAR(16), non-null, primary key
- **ppl_event**: VARCHAR(15), non-null
- **account_id**: VARCHAR(12), non-null, foreign key
- **leader_name**: VARCHAR(80), non-null
- **badge_name**: VARCHAR(40), non-null
- **bio**: VARCHAR(800), non-null
- **tagline**: VARCHAR(150), non-null
- **battle_difficulties**: TINYINT(4), non-null
- **battle_formats**: TINYINT(4), non-null
- **battle_code**: VARCHAR(9), nullable

## ppl_webapp_battles

Stores the data that backs the battle object and drives both battle history and queues, with the following columns:

- **id**: INT, non-null, primary key, autoincrement
- **ppl_event**: VARCHAR(15), non-null
- **challenger_id**: VARCHAR(16), non-null
- **leader_id**: VARCHAR(16), non-null
- **battle_difficulty**: TINYINT(4), non-null
- **battle_format**: TINYINT(4), non-null
- **battle_status**: TINYINT(3), non-null
- **battle_code**: VARCHAR(9), non-null
- **queued_at_utc**: TIMESTAMP, non-null
- **recorded_at_utc**: TIMESTAMP, nullable

## ppl_webapp_reports

Stores the data that backs the report object, with the following columns:

- **id**: INT, non-null, primary key, autoincrement
- **challenger_id**: VARCHAR(16), non-null
- **leader_id**: VARCHAR(16), non-null
- **ppl_event**: VARCHAR(15), non-null
- **notes**: VARCHAR(500), nullable
- **reported_at_utc**: TIMESTAMP, non-null

[Back to top](#table-of-contents)

# API Documentation

## Notes

### A note on errors

**Any** time a resource in this API returns a non-200 status, the JSON payload will be in the following format:

```json
{
    "error": "An unexpected database error occurred, please try again.",
    "code": 1
}
```

The `error` property is a human-readable message that can be used for toasts, snackbars, or however else to inform users that a request failed and why. The `code` property is the internal value defined in the [resultCode constant](#resultcode) that the API uses and can generally be ignored by clients.

[Back to top](#table-of-contents)

## Custom Headers

### PPL-Event

A string indicating the event this request is for. The value should be formatted as `[event]-[year]`. `year` should be a 4-digit number, and `event` **must** be one of:

- `East`
- `West`
- `Aus`

For example, `East-2025` would be a valid value, but `East-25` or `South-2025` would not.

[Back to top](#table-of-contents)

## Authentication APIs

### Resource: /api/v3/account

The top-level resource for all account-related requests. This resource supports the following verbs:

#### POST

Creates a new account using the provided username and password, along with an associated challenger object and login session. If the username is already taken or the username and/or password don't meet the defined requirements, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Basic scheme](https://www.rfc-editor.org/rfc/rfc7617).
- `PPL-Event` - A custom header defined [here](#ppl-event).

##### Optional headers:

- `Platform` - A string indicating the platform this request is coming from. Can be one of:
    - `web`
    - `android`
    - `ios`

**Note**: The `Platform` header will be populated as `none` if omitted or invalid. It may be made a required header in the future if and when we figure out push notification functionality.

##### Response payload:

```json
{
    "accountId": "123456abcdef",
    "token": "216b89d8d1586a9532429c50149fa0d1"
}
```

The `accountId` and `token` fields in the response should be provided in headers for subsequent authenticated API calls.

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the Authorization header is omitted or malformed, or if the username is already in use.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Sub-resource: /api/v3/account/me

The resource for managing the current logged-in user's account. This resource supports the following verbs:

#### GET

Fetches a payload of account-related information, with links to other relevant resources.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
    "permissions": {
        "isChallenger": true,
        "isLeader": false,
        "isAdmin": false
    },
    "_links": {
        "info": "/api/v3/challenger/{challengerId}",
    }
}
```

**Note:** The `info` property contained within the `_links` property will be populated with either a link to challenger or leader info, depending on the permissions above.

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

#### DELETE

Terminates the account, preventing it from being logged into again and freeing up the username for a new registration. **Note:** Any client making this request should confirm the action with the user first so as to prevent an accidental account termination.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{}
```

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Resource: /api/v3/session

The top-level resource for all session-related requests. This resource supports the following verbs:

#### POST

Creates a new session by logging in the user using the provided username and password. If the provided credentials are invalid, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Basic scheme](https://www.rfc-editor.org/rfc/rfc2617#section-2).
- `PPL-Event` - A custom header defined [here](#ppl-event).

##### Optional headers:

- `Platform` - A string indicating the platform this request is coming from. Can be one of:
    - `web`
    - `android`
    - `ios`

**Note**: The `Platform` header will be populated as `none` if omitted or invalid. It may be made a required header in the future if and when we figure out push notification functionality.

##### Response payload:

```json
{
    "accountId": "123456abcdef",
    "token": "216b89d8d1586a9532429c50149fa0d1"
}
```

The `accountId` and `token` fields in the response should be provided in headers for subsequent authenticated API calls.

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the Authorization header is omitted or malformed.
- HTTP 401 (UNAUTHORIZED) - Returned if the provided credentials are invalid.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Sub-resource: /api/v3/session/me

The resource for managing the current logged-in user's session. This resource supports the following verbs:

#### DELETE

Terminates the current session, logging the user out. If one or both of the headers is omitted or malformed, this path simply does nothing rather than return an error.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{}
```

[Back to top](#table-of-contents)

## Challenger APIs

### Resource: /api/v3/challenger

The top-level resource for all challenger-related requests. This resource supports the following verbs:

#### GET

Fetches a full list of challengers associated with the PPL event for the session. The primary use for this resource is pulling a list of challengers so the leader view can populate a dropdown for adding challengers to their queue.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
    "challengers": [
        {
            "challengerId": "1a2b3c4d5e6f7890",
            "displayName": "Steeve"
        },
        ...
    ]
}
```

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the query parameter is omitted or malformed.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a non-leader.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Sub-resource: /api/v3/challenger/:challengerId

The resource for managing the current logged-in user's challenger information. This resource supports the following verbs:

#### GET

Fetches the challenger data for the logged-in user. If the user is a leader, or the challenger ID in the request doesn't belong to the logged-in account, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
    "displayName": "Steeve",
    "_links": {
        "bingoBoard": "/api/v3/challenger/1a2b3c4d5e6f7890/bingoboard",
        "openBattles": "/api/v3/battle/?challengerId=1a2b3c4d5e6f7890&format=queue",
        "battleHistory": "/api/v3/battle/?challengerId=1a2b3c4d5e6f7890&format=history",
        "battleStats": "/api/v3/battle/?challengerId=1a2b3c4d5e6f7890&format=stats",
        "feedbackSurvey": "https://forms.gle/..."
    }
}
```

**Note:** The `feedbackSurvey` link will only be included if it's close enough to the end of the PPL event, as determined by an event config field.

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a leader, or if the challenger ID isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

#### PUT

Updates the logged-in user's display name with the value provided in the request body. If the provided display name is invalid (too short, too long, unsupported characters), already taken, omitted, or if the user is a leader, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Body parameters:

- `displayName` - The new display name.

##### Response payload:

```json
{
    "displayName": "Sir Steeven III, Esq."
}
```

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the `displayName` parameter is invalid, omitted, or taken.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a leader, or if the challenger ID isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Sub-resource: /api/v3/challenger/:challengerId/bingoboard

The resource for managing the current logged-in user's bingo board. This resource supports the following verbs:

#### GET

Fetches the logged-in user's bingo board. The board will be provided as a 2D array of objects containing the leader's ID (for pulling image resources) and a flag indicating whether or not the challenger has battled that leader (i.e. whether the bingo square should be checked off). If the board has a free space, its leader ID will be represented as an empty string. The response payload will also contain a flag indicating whether the user has completed a line on their board so clients can notify users that they can claim a prize. If the user is a leader, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
    "hasBingo": false,
    "bingoBoard": [
        [
            {
                "leaderId": "1234567890abcdef",
                "battled": true,
                "_links": {
                    "bingoAsset": "/static/bingo/1234567890abcdef.png"
                }
            },
            {
                "leaderId": "abcdef1234567890",
                "battled": false,
                "_links": {
                    "bingoAsset": "/static/bingo/abcdef1234567890.png"
                }
            },
            ...
        ],
        ...
    ]
}
```

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a leader, or if the challenger ID isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

[Back to top](#table-of-contents)

## Leader APIs

### Resource: /api/v3/leader

The top-level resource for all leader-related requests. This resource supports the following verbs:

#### GET

Fetches a full list of leaders for the PPL event specified in the request header. The primary use for this resource is pulling a list of leaders for display on the digital trainer card. Because the trainer card is visible even on the logged-out view, this GET request **does not require authentication**. The `battleDifficulties` and `battleFormats` fields in the response will be populated with values defined in the [constants](#constants) section below. The query parameter is **required** and the request will be rejected if it's omitted or invalid.

##### Required headers:

- `PPL-Event` - A custom header defined [here](#ppl-event).

##### Response payload:

```json
{
    "leaders": [
        {
            "id": "1234567890abcdef",
            "leaderName": "Leopold, the Masterful Magician",
            "badgeName": "Illusion Emblem",
            "bio": "...",
            "tagline": "...",
            "battleDifficulties": 8,
            "battleFormats": 1,
            "_links": {
                "portraitAsset": "/static/portraits/1234567890abcdef.png",
                "badgeAsset": "/static/badges/1234567890abcdef.png"
            }
        },
        ...
    ]
}
```

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the `PPL-Event` header is invalid or omitted.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Sub-resource: /api/v3/leader/:leaderId

The resource for managing the current logged-in user's leader information. This resource supports the following verbs:

#### GET

Fetches the leader data for the logged-in user. If the user is not a leader, or the leader ID in the request doesn't belong to the logged-in account, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
    "id": "1234567890abcdef",
    "leaderName": "Leopold, the Masterful Magician",
    "_links": {
        "openBattles": "/api/v3/battle/?leaderId=1234567890abcdef&format=queue",
        "battleHistory": "/api/v3/battle/?leaderId=1234567890abcdef&format=history",
        "battleStats": "/api/v3/battle/?leaderId=1234567890abcdef&format=stats",
        "feedbackSurvey": "https://forms.gle/..."
    }
}
```

**Note:** The `feedbackSurvey` link will only be included if it's close enough to the end of the PPL event, as determined by an event config field.

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a non-leader, or if the leader ID isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

#### PUT

Updates the leader's custom battle code. If an empty body is provided, the battle code is malformed, or the user is not a leader, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Body parameters:

- `battleCode` - An 8-digit numeric battle code, or an empty string to clear any existing custom code. If setting a code, the value **must** be exactly 8 characters long, all numeric.

##### Response payload:

```json
{
    "battleCode": "1234 5678"
}
```

**Note:** Battle codes are saved internally with a space between each quartet of digits for better readability. The `battleCode` in the response payload will be formatted with the space, like the ones in the response payload for the `GET /api/v3/battle` request, even though the request parameter requires that it be omitted.

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the request body is empty or the provided `battleCode` parameter is malformed.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a non-leader, or if the leader ID isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

[Back to top](#table-of-contents)

## Battle APIs

### Resource: /api/v3/battle

The top-level resource for all battle-related requests. This resource supports the following verbs:

#### GET

Fetches a list of battles based on the provided query parameters. The query parameters **must** include exactly one of `challengerId` **or** `leaderId`, along with a `format`. If an invalid combination of query paramters is provided, the request will be rejected. The `battleDifficulty`, `battleFormat`, and `battleStatus` fields in the response will be populated with values defined in the [constants](#constants) section below.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Query parameters:

- `challengerId` - The challenger ID to filter on for battle data.
- `leaderId` - The leader ID to filter on for battle data.
- `format` - The type of data being requested. Can be one of: `queue` (open battles), `history` (completed battles), or `stats` (computed statistics data).

##### Response payload:

`queue` format:
```json
{
    "battles": [
        {
            "id": 1,
            "challengerId": "1a2b3c4d5e6f7890",
            "leaderId": "1234567890abcdef",
            "battleDifficulty": 8,
            "battleFormat": 1,
            "battleStatus": 0,
            "battleCode": "1234 5678",
            "position": 1
        },
        ...
    ]
}
```

**Note:** The `position` property is 1-indexed and should be used both for display on clients and for determining whether to show the battle code (i.e. when `position` is 1).

`history` format:
```json
{
    "battles": [
        {
            "id": 1,
            "challengerId": "1a2b3c4d5e6f7890",
            "leaderId": "1234567890abcdef",
            "battleDifficulty": 8,
            "battleFormat": 1,
            "battleStatus": 3,
            "recordedAtUtc": "2024-03-22T15:08:17.324Z"
        },
        ...
    ],
    "_links": {
        "championSurvey": "https://forms.gle/..."
    }
}
```

**Note:** The `championSurvey` link will only be included if the request is made by a challenger who's defeated the league champion.

`stats` format:
```json
{
    "totalBattles": 14,
    "wins": 9,
    "losses": 5,
    "badgeCount": 10,
    "badgePoints": 11,
    "badgesAwarded": 4
}
```

**Note:** The `badgeCount` and `badgePoints` properties will only be relevant for challengers and the `badgesAwarded` property will only be relevant for leaders. Irrelevant fields will be omitted from the payload.

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the required parameters are omitted or invalid.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the leader or challenger ID in the query string isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

#### POST

Creates a new battle using the parameters provided in the request body. If any required body parameters are invalid or omitted, or the user is a challenger, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Body parameters:

- `challengerId` - The challenger ID for the new battle.
- `leaderId` - The leader ID for the new battle.
- `battleDifficulty` - The battle difficulty for the new battle.
- `battleFormat` - The battle format for the new battle.

##### Response payload:

```json
{
    "battleId": 1
}
```

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the required parameters are omitted or invalid.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a non-leader, or if the leader ID in the request body isn't associated with the logged-in account.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

### Sub-resource: /api/v3/battle/:battleId

The resource for managing a specific battle. This resource supports the following verbs:

#### PUT

Updates the specified battle using the parameters provided in the request body. Leaders are able to set the battle status to any valid value, while challengers can **only** set the status to 1 (on hold). If the required body parameter is invalid or omitted, the requesting user isn't a participant in the battle, or the provided battle status is invalid for the user type, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Body parameters:

- `battleStatus` - The new status for the battle.

##### Response payload:

```json
{
    "battleStatus": 2
}
```

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the required parameter is omitted or invalid.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the requesting user isn't a participant in the battle or doesn't have permission to set the provided status.
- HTTP 404 (NOT FOUND) - Returned if the battle ID doesn't exist.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

#### DELETE

Cancels the battle, removing it from the queue. If the requesting user isn't a participant in the battle, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
}
```

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the requesting user isn't a participant in the battle.
- HTTP 404 (NOT FOUND) - Returned if the battle ID doesn't exist.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

[Back to top](#table-of-contents)

## Reporting APIs

### Resource: /api/v3/report

The top-level resource for all report-related requests. This resource supports the following verbs:

#### GET

Fetches a list of all the reports that have been made against challengers. If the requesting user is a non-admin, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Response payload:

```json
{
    "reports": [
        {
            "challengerName": "Steeve",
            "reportedBy": [
                {
                    "leaderName": "Leopold, the Masterful Magician",
                    "event": "East-2025",
                    "notes": "Got angry/aggressive when told his team violated the stall clause",
                    "reportedAtUtc": "2024-03-20T17:14:13.723Z"
                },
                {
                    "leaderName": "Leafa, the Steeper",
                    "event": "East-2025",
                    "notes": "",
                    "reportedAtUtc": "2024-03-20T17:23:30.373Z"
                },
                ...
            ]
        },
        ...
    ]
}
```

##### Possible error responses:

- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a non-admin.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

#### POST

Creates a new report using the challenger ID provided in the request body. If no challenger ID is provided in the body paramters or the requesting user is a non-leader, the request will be rejected.

##### Required headers:

- `Authorization` - Authentication header following the [Bearer scheme](https://www.rfc-editor.org/rfc/rfc6750#section-2.1).
- `Account-ID` - The account ID for the logged-in user.

##### Body parameters:

- `challengerId` - The ID for the challenger being reported.
- `notes` - An optional detailed message about the leader's interaction with the challenger and why they're filing a report. This parameter has a 500-character limit which should be imposed on the client, as longer values will be truncated to fit in the database table.

##### Response payload:

```json
{
}
```

##### Possible error responses:

- HTTP 400 (BAD REQUEST) - Returned if the required parameter is omitted or invalid.
- HTTP 401 (UNAUTHORIZED) - Returned if either header is omitted or malformed, or if session validation fails.
- HTTP 403 (FORBIDDEN) - Returned if the request is made by a non-leader.
- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

[Back to top](#table-of-contents)

## Other APIs

### Resource: /api/v3/settings

The top-level resource for all settings-related requests. This resource supports the following verbs:

#### GET

Fetches a list of settings for the PPL event specified in the request header, along with links for any data that should be visible for a logged-out view (e.g. trainer card, league info, prizes).

##### Required headers:

- `PPL-Event` - A custom header defined [here](#ppl-event).

##### Response payload:

```json
{
    "eventEndDateUtc": "2024-03-25T00:00:00Z",
    "eventSupportsQueueState": false,
    "leagueFormat": {
        "badgesForElites": 8,
        "emblemsForChamp": 0,
        "badgesForChamp": 16,
        "emblemWeight": 2
    },
    "meetupTimes": [
        {
            "location": "Handheld Lounge",
            "startTimeUtc": "2024-03-22T17:30:00.000Z",
            "durationInMinutes": 120
        },
        ...
    ],
    "_links": {
        "trainerCard": "/api/v3/leader"
        "rulesAsset": "/static/assets/rules.png",
        "prizesAsset": "/static/assets/prizes.png",
        "scheduleAsset": "/static/assets/schedule.png",
        "mapAsset": "/static/assets/map.png"
    }
}
```

##### Possible error responses:

- HTTP 500 (SERVER ERROR) - Returned if an internal error occurs.

[Back to top](#table-of-contents)

# Constants

The following constants will be used as part of the API:

#### resultCode

These codes will be returned in **most** error payloads alongside an error string, to provide additional context around the nature of the error.

```json
{
    "success": 0,
    "dbFailure": 1,
    "usernameTooShort": 2,
    "usernameTooLong": 3,
    "passwordTooShort": 4,
    "usernameTaken": 5,
    "registrationFailure": 6,
    "badCredentials": 7,
    "invalidToken": 8,
    "notFound": 9,
    "alreadyInQueue": 10,
    "alreadyWon": 11,
    "queueIsFull": 12,
    "tooManyChallenges": 13,
    "notInQueue": 14,
    "queueIsClosed": 15,
    "notEnoughBadges": 16,
    "notEnoughEmblems": 17,
    "unsupportedDifficulty": 18,
    "unsupportedFormat": 19,
    "queueAlreadyOpen": 20,
    "queueAlreadyClosed": 21,
    "queueStateNotSupported": 22,
}
```

#### permission

These are used to identify what permissions are associated with a given account, and are only used **internally** to the API. This constant is a bitmask, as accounts can have multiple permissions at the same time. Permissions are exposed to clients as boolean flags rather than internal bitmask values.

```json
{
    "challenger": 1,
    "leader": 2,
    "admin": 4
}
```

#### battleDifficulty

These are used to identify what battle difficulties a leader supports, and will both be returned in some payloads and expected as parameters in some requests. While this constant is a bitmask, only the first **three** values (`casual`, `intermediate`, `veteran`) will ever be masked together; `elite` and `champion` should never be combined with other values.

```json
{
    "casual": 1,
    "intermediate": 2,
    "veteran": 4,
    "elite": 8,
    "champion": 16
}
```

#### battleFormat

These are used to identify what battle formats a leader supports, and will both be returned in some payloads and expected as parameters in some requests. This constant is a bitmask, as leaders can support multiple battle formats.

```json
{
    "singles": 1,
    "doubles": 2,
    "multi": 4,
    "special": 8
}
```

#### battleStatus

These are used to identify the current status of a battle in the battles database table, and are only used **internally** to the API. Results are from the **challenger perspective** - `loss` refers to a challenger loss, and `win` a challenger win. `ash` and `gary` are special results for when a battle is lost but a badge is awarded, or a battle is won but a badge is **not** awarded (e.g. due to bad sportsmanship), respectively.

```json
{
    "inQueue": 0,
    "onHold": 1,
    "loss": 2,
    "win": 3,
    "ash": 4,
    "gary": 5
}
```

#### battleDataFormat

These are used to identify the requested format when a user requests calls the `GET /api/v3/battle` resource, and are only used **internally** to the API. It's mapped to the string values passed in the query string for the request.
```json
{
    "queue": 0,
    "history": 1,
    "stats": 2
}
```

#### queueStatus

These are used to identify the current status of a leader's queue, and are only used **internally** to the API. While far from necessary, this constant helps keep the code more readable.

```json
{
    "closed": 0,
    "open": 1
}
```

#### httpStatus

These are used as a mapping for the subset of HTTP status codes that can be returned, and are only used **internally** to the API. This mapping should be expanded if any additional status codes are ever used.

```json
{
    "ok": 200,
    "badRequest": 400,
    "unauthorized": 401,
    "forbidden": 403,
    "notFound": 404,
    "serverError": 500
}
```

#### websocketAction

These are used to identify the action being sent along a websocket connection for real-time update support. `authenticate` and `confirm` are both part of the handshake process and `refreshData` is currently the only supported RTU action.

```json
{
    "authenticate": 0,
    "confirm": 1,
    "refreshData": 2,
    "refreshBingo": 3
}
```

[Back to top](#table-of-contents)

# Websockets

To support real-time updates within the webapp without requiring a full page refresh, this API allows clients to establish secure websocket connections over which they can receive poke payloads notifying them that the queue status for a logged-in user has changed through someone else's actions. For example:

* A challenger's queue updating itself when a leader finishes a battle.
* A leader's queue updating itself when a challenger joins, leaves, or places themselves on hold.

And so on. As the socket connections **must** be authenticated, an additional step beyond the simple handshake needs to be completed as part of the connection flow. Implementing clients should do the following steps:

1. Make a request using any websocket library to the base URL and port for the API, but with the `wss://` protocol (`ws://` if the API is being served over HTTP and not HTTPS).
2. Configure the `message` event listener to parse the data into a JSON object.
3. Handle each action as defined by the [websocketAction constant](#websocketaction) as follows:
   * `authenticate`: Send a stringified JSON blob to the server over the websocket containing the `action` field (echoed back), an `id` field populated with the user's login ID, and a `token` field populated with the user's session token (including the `Bearer ` prefix that you would include in API request headers).
   * `confirm`: No action needed; this message is simply confirmation from the server that the authentication payload was valid.
   * `refreshData`: Pull the latest challenger or leader info payload from the API, depending on whether the logged in user is a challenger or a leader, and update any parts of the UI that need to be updated.
   * `refreshBingo`: Pull the latest bingo board data from the API and update that view. **Note:** This will only be sent to challengers, and should only be acted on if the bingo board view is currently open.

**All** messages sent from the server over websockets will be stringified JSON blobs that contain an `action` property with a value defined by the constant above. At present, no other fields will be included in any of the payloads, but the JSON format offers the flexibility to add them in the future if needed.

[Back to top](#table-of-contents)
