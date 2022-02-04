import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    Client
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";

export class KCommandReport extends KCommand {
    constructor() {
        super()
        this.command_name = "report";

        this.permissions = [
            "command.report"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length >= 1);
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

        let message_string: string = "";

        for (let i = 1; i < command.getArguments().length; i++) {
            message_string += command.getArguments()[i]+" ";
        }

        server.getUser(user).addEntry(message_string.trim(), msg, conf);

        msg.channel.send(conf
            .getTranslationStr(msg, "command.report.reported")
                .replace("{1}", command.getArguments()[0]));
    }
}