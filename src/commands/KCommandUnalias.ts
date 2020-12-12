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
import { config } from "process";
import { KServer } from "../KServer";
import { KRole } from "../KRole";
import { KUser } from "../KUser";
import { KCommandManager } from "../KCommandManager";
import { Client } from "@typeit/discord/Client";

export class KCommandUnalias extends KCommand {
    constructor() {
        super()
        this.command_name = "unalias";

        this.permissions = [
            "admin.unalias.alias",
            "admin.unalias.entirely"
        ];
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length != 1 &&
            cmd.getArguments().length != 2) {
            return false;
        }

        if (cmd.getArguments().length == 2
            && cmd.getArguments()[1] != "all") {

            return false;
        }

        return true;
    }

    // !unalias <<alias>|<command> all>
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        if (command.getArguments().length == 2) {
            if (KCommandManager.getCommand(command.getArguments()[0]) == undefined) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.not_found"
                ).replace("{1}", command.getArguments()[0]));

                return;
            }

            server.removeAliasesForCommand(command.getArguments()[0]);
            conf.logMessageToServer(client, server.getID(), new MessageEmbed()
                .setColor("#fc6f6f")
                .setTitle(conf.getTranslationForServer(
                    msg.guild.id,
                    "log.removed_all_alias.title")
                        .replace("{1}", (new Date().toLocaleString())))
                .setDescription(conf.getTranslationForServer(
                    msg.guild.id,
                    "log.removed_all_alias.body")
                        .replace("{1}", command.getArguments()[0])))

            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.unalias.all_cleared"
            ).replace("{1}", command.getArguments()[0]));

        } else {
            let owner_name = server.getAlias(command.getArguments()[0]);

            if (!server.removeAlias(command.getArguments()[0])) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.unalias.no_alias"
                ).replace("{1}", command.getArguments()[0]));

            } else {
                conf.logMessageToServer(client, server.getID(), new MessageEmbed()
                    .setColor("#fc6f6f")
                    .setTitle(conf.getTranslationForServer(
                        msg.guild.id,
                        "log.removed_alias.title")
                            .replace("{1}", (new Date().toLocaleString())))
                    .setDescription(conf.getTranslationForServer(
                        msg.guild.id,
                        "log.removed_alias.body")
                            .replace("{1}", command.getArguments()[0])
                            .replace("{2}", owner_name)))

                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.unalias.cleared"
                ).replace("{1}", command.getArguments()[0]));
            }
        }
    }
}