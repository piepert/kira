import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    TextChannel,
    Client
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
        sender: KUser,
        client: Client) {

        let args = command.getArguments();
        let channel = msg.guild.channels.cache.find(channel =>
            channel.name === args[0]);

        if (channel == undefined) {
            channel = msg.guild.channels.cache.find(ch =>
                ch.id.toString() == args[0]);
        }

        if (channel == undefined) {
            channel = msg.guild.channels.cache.find(ch =>
                ch.id.toString() == args[0].substr(2, args[0].length-3));
        }

        let channel_name = args.shift();
        let message = args.join(" ");

        if (channel == undefined) {
            msg.channel.send(conf
                .getTranslationStr(msg, "command.say.channel_not_found")
                    .replace("{1}", channel_name));
            return;
        }

        (channel as TextChannel).send(message);
    }
}