# MLB Gameday Bot
A bot that integrates with the MLB Stats API to track your team of choice. For me, it's the Cleveland Guardians.

Upon startup, the bot looks for your team's games in a 48-hour window centered on the current date - 24 hours into the past, 24 hours into the future. Whichever game (or games, in the case of a doubleheader) is the closest to the current date is
set as the "current" game, and will be the game for which a lot of the commands returns data. Slash Commands include:

- **/starters** - look at the starting pitching matchup for the current game. Includes portraits of both starters, their W/L, ERA, and WHIP, and a list of the pitches they throw.
- **/standings** - check the standings for your team's division. 
- **/lineup** - view the lineup card for the current game.
- **/line_score** - view the line score for the current game. 
- **/box_score** - view the box score for the current game, including hitting and pitching stats.
- **/highlights** - get a curated list of direct links to key plays from the game. The links provide high quality videos.
- **/gameday_subscribe** - subscribe a given Discord channel to receive real-time updates from the "Gameday" feed. This command is restricted to certain roles. The bot connects to Gameday via a WebSocket and pushes events to each subscribed channel. Right now
                      this is scoring plays only. The message includes a description of the play, the change in score, and exit velo/launch angle/hit distance for balls in play.
- **/gameday_unsubscribe** - un-subscribe a given Discord channel from the above functionality.
- **/schedule** - view the upcoming schedule for the next week of games.

...and likely more to follow!

Examples:

![boxscore](https://github.com/AlecM33/gameday-bot/assets/24642328/8e1da205-8a81-4db9-9a8c-9791f44c3113)

![gameday](https://github.com/AlecM33/gameday-bot/assets/24642328/53852830-c0f5-4051-8cba-0e7d92a72f77)

![starters](https://github.com/AlecM33/gameday-bot/assets/24642328/ced20a8b-9f7b-4d71-9b81-e5abf186fe14)

# Tech Stack

Written in JavaScript using [Discord.js](https://discord.js.org/).

The bot uses a PostgreSQL database hosted for free on the [Aiven Platform](https://aiven.io/) to keep track of the Discord channels that have subscribed to the real-time gameday feature.

I make use of several useful npm packages such as `sharp`, `ascii-table`, and `reconnecting-websocket`.

I integrate with the MLB stats API for a dizzying amount of data. Its documentation is limited, but there is some. Shout out to Todd Roberts and his project for getting me acquainted with some of the subtleties: https://pypi.org/project/MLB-StatsAPI/. You can also
view the spec for the MLB's "master game object", nicknamed GUMBO, here: https://bdata-research-blog-prod.s3.amazonaws.com/uploads/2019/03/GUMBOPDF3-29.pdf. I'm also happy to answer what I can about how to use the API.
