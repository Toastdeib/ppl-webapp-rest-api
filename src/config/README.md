# Configuration Files

The configuration framework for this API is driven by several files which should **not** be checked in, on account of containing sensitive information (such as SQL user credentials) and needing to change regularly from year to year. The core file to this framework, [config.js](config.js), is the one that any module that requires config fields should import. It reads from six actual config files (each of which is based on [config.js.example](config.js.example)) and constructs a combined config object based on the general configs, plus any event-specific overrides.

In order for the API to run, the six actual config files **must all exist**. Those files are:

- `general.js`: The baseline configs that any event-specific configs will override. This file **must** have a value for every config field shown in the example file.
- `event/east.js`: The event-specific configs for PPL East.
- `event/west.js`: The event-specific configs for PPL West.
- `event/aus.js`: The event-specific configs for PPL Aus.
- `event/online.js`: The event-specific configs for PPL Online.
- `event/test.js`: The configs used when running the test suites.

All six of these files should be based on config.js.example, but the ones in the event/ subdirectory should **only** contain the fields being overridden from the general configs in order to keep them simpler and cleaner.

# Configuration Fields

## API Configs

The API configs are all fields that are tied to the basic functionality of the API and include things such as the port it runs on, the location of SSL certificate, and the MySQL connection details. Most of these fields should **only** be set in the general configs and not overridden by individual events, but they can be as needed.

### debug

**Type:** Boolean

A flag which toggles whether the node.js console can be used to enter arbitrary commands while the API is running. This should **never** be set to `true` for production instances, only development/staging instances.

### port

**Type:** Integer

The port the API runs on. Both API resources and websocket connections will be available on this port.

### botApiPath

**Type:** String

The base path, port included, that should be used for requests to the PPL Bot. This is generally only used for PPL Online events and is optional; requests will only be attempted if the path is non-empty.

### certPath

**Type:** String

The filepath to the SSL cert for the machine the API is running on. A valid cert is required in order to serve the API over HTTPS; if you don't have a cert set up, check out LetsEncrypt to get started.

### corsOrigin

**Type:** Array

An array of strings, each of which should be a domain that's permitted to access the API.

### mysqlHost

**Type:** String

The hostname for the machine where the MySQL database that backs this API lives. This can be a domain (e.g. `localhost`) or an IP address (e.g. `127.0.0.1`), but it should **not** include the `https://` prefix.

### mysqlUser

**Type:** String

The username for connecting to the MySQL database at the host defined above.

### mysqlPassword

**Type:** String

The password for connecting to the MySQL database at the host defined above.

### mysqlDatabase

**Type:** String

The name of the MySQL database that the API should connect to.

### tableSuffix

**Type:** String

A suffix which will be appended to **all** tables in queries performed by the database modules. This field is meant to easily enable paralell instances of tables for production, staging, and test suites, each with their own prefixes (no prefix for production, `_staging` for staging, and `_test` for test suites). This setting **may** be retired for v3 in favor of having separate database instances for the different environments instead, including hosting the test database locally.

### websocketPingInterval

**Type:** Integer

The interval at which websocket connections get pinged to check whether or not they're still alive, in milliseconds.

## Event Configs

The event config fields govern the specifics of an individual PPL event, such as start/end dates, meetup times, and badge/emblem requirements. While all of these fields should be set in the general configs, **many** may be overridden by individual event configs, such as all date/time-related fields and the badge/emblem requirements (depending on number of leaders and the league format).

### championSurveyUrl

**Type:** String

The link to the survey for challengers who have beaten the champion to submit their Hall of Fame teams. This is typically a Google Forms link.

### challengerSurveyUrl

**Type:** String

The link to the survey for challengers to provide feedback on their PPL experience. This is typically a Google Forms link.

### leaderSurveyUrl

**Type:** String

The link to the survey for leaders to provide feedback on their PPL experience. This is typically a Google Forms link.

### surveyStartTimeUtc

**Type:** String

The UTC timestamp for when the survey links should start appearing in API responses, in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).

### surveyEndTimeUtc

**Type:** String

The UTC timestamp for when the survey links should stop appearing in API responses, in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).

### trainerCardShowTimeUtc

**Type:** String

The UTC timestamp for when the trainer card should start displaying on clients, in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).

### eventStartTimeUtc

**Type:** String

The UTC timestamp for when the PPL event should be considered as having started, in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601). Before the start date, most non-GET resources will be unavailable to clients.

### eventEndTimeUtc

**Type:** String

The UTC timestamp for when the PPL event should be considered as having ended, in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601). After the end date, most non-GET resources will be unavailable to clients.

### meetupTimes

**Type:** Array

An array of JSON blobs, each of which defines a single meetup time. Each blob **must** contain three properties: `location`, `startTimeUtc`, and `endTimeUtc`. The location is a string for display and the start/end times are UTC timestamps, in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).

### requiredBadgesForElites

**Type:** Integer

The number of badges a challenger needs to have before they can join an elite's queue. If the event has no elites (e.g. a Battle Frontier format), this field will be ignored by the API.

### requiredBadgesForChamp

**Type:** Integer

The number of badges a challenger needs to have before they can join the champion's queue. This field should only be populated if the event either has no elites or doesn't require them in order to reach the champion; otherwise, it should be set to 0.

### requiredEmblemsForChamp

**Type:** Integer

The number of elite emblems a challenger needs to have before they can join the champion's queue. This field should only be populated if the event requires elites in order to reach the champion; otherwise, it should be set to 0.

### emblemWeight

**Type:** Integer

The value of an elite emblem when determining whether a challenger has enough badges to join the champion's queue. This field should only be populated if the event has elites but doesn't require them in order to reach the champion; otherwise, it should be set to 1.

**Note:** For more detail on league format as it relates to these four fields, check [link to the main README goes here].

### maxQueueSize

**Type:** Integer

The maximum number of challengers that can be in a single leader's queue at a given time.

### maxQueuesPerChallenger

**Type:** Integer

The maximum number of queues that a single challenger can be in at a given time.

### bingoBoardWidth

**Type:** Integer

The width of a bingo board for Signature Bingo. Boards are square, so width and height will be the same and as such are driven by a single config field. As bingo boards are typically populated by leaders and **not** elites, the square of this number should generally be less than or equal to the number of leaders in the event, but it can extend into elites if needed (e.g. a value of 5 for an event with 23 leaders and 6 elites).

### excludedBingoIds

**Type:** Array

A list of leader IDs that should be excluded from the pool used to generate bingo boards. This is typically used for the IDs of dummy leaders that we use to award special badges, like the Socialite Badge and Artiste Badge, since those don't have real gym challenges.

### excludedTrainerCardIds

**Type:** Array

A list of leader IDs that should be excluded from the trainer card. This is typically used for the IDs of dummy leaders that we use to award special badges, like the Socialite Badge and Artiste Badge, since those don't have real leader profiles.

### supportsQueueState

**Type:** Boolean

A flag indicating whether the current PPL event supports leaders opening and closing their queues. This should typically only be `true` for PPL Online events, since they allow challengers to join leader queues directly, while in-person events require the leader to add the challenger.

### supportsBotNotifications

**Type:** Boolean

A flag indicating whether the current PPL event supports sending notifications to Discord via the PPL Bot. This should typically only be `true` for PPL Online events, since they otherwise lack the ability to broadcast that sort of information that an in-person event has.

### showBingoBoard

**Type:** Boolean

A flag indicating whether clients should display the bingo board. If this field is `true`, the API will include a link to the bingo board resource in challenger info response payloads.

### showHowToChallenge

**Type:** Boolean

A flag indicating whether clients should display the "How to Challenge" graphic. If this field is `true`, the API will include a link to the graphic from its static image resources folder.

### showRules

**Type:** Boolean

A flag indicating whether clients should display the "Rules" graphic. If this field is `true`, the API will include a link to the graphic from its static image resources folder.

### showPrizePools

**Type:** Boolean

A flag indicating whether clients should display the "Prize Pools" graphic. If this field is `true`, the API will include a link to the graphic from its static image resources folder.

### showSchedule

**Type:** Boolean

A flag indicating whether clients should display the "Schedule" graphic. If this field is `true`, the API will include a link to the graphic from its static image resources folder.

### showMap

**Type:** Boolean

A flag indicating whether clients should display the "Map" graphic. If this field is `true`, the API will include a link to the graphic from its static image resources folder.

