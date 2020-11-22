Date format: YYYY-MM-DD

# v3.0.2 (2020-11-13)

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