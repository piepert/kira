import {
    Message,
    MessageEmbed,
    GuildMember,
    User, TextChannel
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";

export class KCommandSay extends KCommand {
    constructor() {
        super()
        this.command_name = "say";

        this.permissions = [
            "command.say"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length >= 2);
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser) {

        let args = command.getArguments();
        let channel = msg.guild.channels.cache.find(channel => channel.name === args[0]);

        args.shift();
        let message = args.join(" ");

        if (channel == undefined) {
            msg.channel.send(conf
                .getTranslationStr(msg, "command.report.user_not_found")
                    .replace("{1}", command.getArguments()[0]));
            return;
        }

        (channel as TextChannel).send(message);
    }
}