import {
    Message,
    MessageEmbed,
    GuildMember,
    User
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";
import { KEntry } from "../KEntry";
import { Client } from "@typeit/discord/Client";

export class KCommandUnreport extends KCommand {
    constructor() {
        super()
        this.command_name = "unreport";

        this.permissions = [
            "admin.unreport"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length == 2);
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let user: string = await KConf.userToID(
            msg.guild,
            command.getArguments()[0],
            server);

        if (user == undefined || server.getUser(user) == undefined) {
            msg.channel.send(conf
                .getTranslationStr(msg, "command.report.user_not_found")
                .replace("{1}", command.getArguments()[0]));
            return;
        }

        let entry: KEntry = server.getUser(user)
            .getEntries()
            .getEntry(command.getArguments()[1]);

        if (entry == undefined) {

            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.user.entry_not_found"));
            return;
        }

        server.getUser(user)
            .getEntries()
            .removeEntry(entry.getID());

        msg.channel.send(conf
            .getTranslationStr(msg, "command.report.unreported")
            .replace("{1}", entry.getID()));
    }
}