import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    Role
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { config, send } from "process";
import { KServer } from "../KServer";
import { KRole } from "../KRole";
import { KUser } from "../KUser";
import { KCommandManager } from "../KCommandManager";

export class KCommandAlias extends KCommand {
    constructor() {
        super()
        this.command_name = "alias";

        this.permissions = [
            "admin.alias.list",
            "admin.alias.create"
        ];
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length != 1 &&
            cmd.getArguments().length != 2) {                                                       // check for command syntax !user
            return false;
        }

        return true;
    }

    // !alias <command> [alias]
    // !alias <alias> which          - Show which command the
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        cmd: KParsedCommand,
        sender: KUser) {

        if (KCommandManager.getCommand(cmd.getArguments()[0]) == undefined
            && cmd.getArguments()[1] != "which") {
            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.not_found")
                    .replace("{1}", cmd.getArguments()[0])
            );

            return;
        }

        if (cmd.getArguments()[1] != "which") {
            for (let e of [ "unalias" ]) {
                if (cmd.getArguments()[0] == e) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.alias.not_allowed"
                    ).replace("{1}", e));

                    return;
                }

                if (cmd.getArguments()[1] == e) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.alias.name_not_allowed"
                    ).replace("{1}", e));

                    return;
                }
            }
        }

        if (cmd.getArguments().length == 1) {
            if (!sender.canPermission("admin.alias.list")) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.no_permission")
                );

                return;
            }

            let aliases: string = "";
            let ca = server.getAliasesForCommand(cmd.getArguments()[0]);

            if (ca.length == 0) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.alias.no_aliases")
                        .replace("{1}", cmd.getArguments()[0])
                );

                return;
            }

            for (let i in ca) {
                aliases += "**"+ca[i]+"**; ";
            }

            aliases = aliases.trimEnd().substr(0, aliases.length-2);

            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.alias.list")
                    .replace("{1}", cmd.getArguments()[0])
                    .replace("{2}", aliases)
            );
        } else if (cmd.getArguments()[1] == "which") {
            if (server.getAlias(cmd.getArguments()[0]) == undefined) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.alias.not_found")
                        .replace("{1}", cmd.getArguments()[0])
                );

                return;
            }

            msg.channel.send(conf.getTranslationStr(msg, "command.alias.which")
                .replace("{1}", cmd.getArguments()[0])
                .replace("{2}", server.getAlias(cmd.getArguments()[0])));

        } else {
            if (!sender.canPermission("admin.alias.create")) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.no_permission")
                );

                return;
            }

            server.setAlias(cmd.getArguments()[1], cmd.getArguments()[0]);

            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.alias.success")
                    .replace("{1}", cmd.getArguments()[0])
                    .replace("{2}", cmd.getArguments()[1])
            );
        }
    }
}