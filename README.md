# Guild March collector

The weekly data update for [guildmarch.com](https://guildmarch.com), an unofficial weekly guild
ranking for WoW: Forever. Twice a week (Monday and Thursday, 08:00 KST) a GitHub Actions run reads
registered guilds from the Battle.net public API, scores the week, builds the site and deploys it.

`web/` is a copy of the site's code; the workflow is `.github/workflows/collect.yml`. This repo is
updated by copying, so pull requests here aren't merged.

Guild March is an unofficial fan site and isn't affiliated with Blizzard Entertainment. Game data
comes from Blizzard Entertainment. World of Warcraft is a trademark of Blizzard Entertainment.
