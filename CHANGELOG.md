Date format: YYYY-MM-DD

# v3.0.7 (28.2.2021)

* ignore empty command names (just `!` or `! abc`)
* added command `!get_log` (`src/commands/KCommandGetLog.ts`)
* added command `!stat` (`src/commands/KCommandStat.ts`)
* added possibility to use `!say` with the plain channel ID
* added DM commands for KIRA operators
    * it's now possible as a KIRA operator to execute the command from another
      server by using the following syntax: `<server_id> <command ...>`
    * everything after `server_id` will be treated as a normal message on this
      server sent by the operator
* added case-insensitivity for command names and aliasses (case-sensitive
  command names are still possible)
* fixed losing of status by updating the status every 12h
* fixed link generation for wikidot avatars in wiki-feeds (now with timestamp)
* changed log name format to `KIRA_log_DD.MM.YYYY.log`, the log
  file will change with the current date
* added auto-response on messages, customizable for every server
* now going to erase old server-config-jsons and replace it with a new
  server-directory
* jokes are being put into a randomized waitlist instead of picking one
  randomly from the file

# v3.0.6 (2020-12-22)

* added log message for patches
* disabled logging for auto-saves
* added help pages for all commands
* added command `!syntax` (`src/commands/KCommandSyntax.ts`)
* implemented `setBanState` and `kick` functions in `src/KUser.ts`
* added logging of patches
* added determination of auto-save or manual save

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