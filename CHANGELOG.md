Date format: YYYY-MM-DD

# v3.0.5 (2020-12-12)

* catching all uncaught exceptions and print them to console
* added logging message/log channel, logging ...
    * bans/unbans
    * nickname changes
    * alias added/removed
    * user entries added
    * user joined/left the server
    * config saving
* added `!config log <channel>` command to set the log channel for the log
* added possibility to show all serverside translation changes (`!config translation show`)
* added command `!welcome` (`src/commands/KCommandWelcome.ts`)
* added command `!help` (`src/commands/KCommandHelp.ts`)
* fixed bug in parser/tokenizer of commands with: no more problems with `"`
* added help pages in translation files for:
    * `!help`
    * `!welcome`
    * `!dice`
    * `!joke`
* added possibility to change color and title of RSS feeds

# v3.0.4 (2020-11-30)

* fixed error in feed (error: undefined `result.rss`)
* added auto-save every 60 minutes
* implemented command `!config` (`src/commands/KCommandConfig.ts`)
* now saving servers in splittet configs and subdirectories
    * KIRA still loads the old config files (from v3.0.3 and before) and converts them to the new format
    * following folder structure:
    * `servers/<server_id>`
        * `.../<server_id>.json` - server-side settings
        * `.../channels/<feed_id>.json` - channel configurations for RSS feeds
        * `.../users/<user_id>.json` - user configurations and report entries
        * `.../roles/<role_id>.json` - role configurations and permissions

# v3.0.3 (2020-11-22)

* fixed wrong date in CHANGELOG.md (v3.0.2 (2020-11-13) to v3.0.2 (2020-11-22))
* fixed patch error for non-Windows hosts

# v3.0.2 (2020-11-22)

* now loading version from package.json
* fixed bugs of wiki-feed (mostly crashes)
* removed duplicate saving from KRole and KUser
* added commands:
    * `!thanks` (`src/commands/KCommandThanks`)
    * `!patch` (`src/commands/KCommandPatch`)

# v3.0.1 (2020-10-31)

* added command `!exit_hard` (`src/commands/KCommandExit.ts`)
* fixed usage of `!say` command, now possible to use:
    * `!say channel_name ...`, e.g. `!say testchannel1 Hello World!`
    * `!say <#ID> ...`, e.g. `!say #testchannel1 Hello World!` (#testchannel1 from Discord's autocompletion)

# v3.0.0 (2020-10-31)

* added basic functionality:
    * rss parsing
    * permission management
* commands added:
    * `!activate` (`src/commands/KCommandActivate`)
    * `!alias` (`src/commands/KCommandAlias`)
    * `!ban` (`src/commands/KCommandBan`)
    * `!config` (`src/commands/KCommandConfig`)
    * `!joke` (`src/commands/KCommandJoke`)
    * `!kick` (`src/commands/KCommandKick`)
    * `!perm` (`src/commands/KCommandPerm`)
    * `!ping` (`src/commands/KCommandPing`)
    * `!refresh` (`src/commands/KCommandRefresh`)
    * `!reload_hard` (`src/commands/KCommandReload`)
    * `!reload` (`src/commands/KCommandReloadServer`)
    * `!report` (`src/commands/KCommandReport`)
    * `!save` (`src/commands/KCommandSave`)
    * `!say` (`src/commands/KCommandSay`)
    * `!unalias` (`src/commands/KCommandUnalias`)
    * `!unban` (`src/commands/KCommandUnban`)
    * `!unreport` (`src/commands/KCommandUnreport`)
    * `!user` (`src/commands/KCommandUser`)