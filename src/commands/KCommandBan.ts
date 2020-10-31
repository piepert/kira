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
import { KCommandManager } from "../KCommandManager";
import { KUser } from "../KUser";

export class KCommandBan extends KCommand {
    constructor() {
        super()
        this.command_name = "ban";

        this.permissions = [
            "admin.ban"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length >= 1);
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser) {

        let user: string = await KConf.userToID(
            msg.guild,
            command.getArguments()[0],
            server);

        if (user == undefined || server.getUser(user) == undefined) {
            msg.channel.send(conf
                .getTranslationStr(msg, "command.ban.user_not_found")
                .replace("{1}", command.getArguments()[0]));
            return;
        }

        let message_string: string = "";

        for (let i = 1; i < command.getArguments().length; i++) {
            message_string += command.getArguments()[i]+" ";
        }

        if (message_string.trim().length == 0) {
            message_string = "empty";
        }

        server.getUser(user).ban(("[ KIRA-BAN "+(new Date()).toUTCString()+" ] "+message_string.trim()).trim(), msg);

        await msg.guild.members.resolve(user)
            .send(conf.getTranslationStr(msg, "command.ban.user_msg")
                .replace("{1}", msg.guild.name)
                .replace("{2}", message_string.trim()));

        msg.guild.members.ban(user);
        msg.channel.send(conf
            .getTranslationStr(msg, "command.ban.banned")
            .replace("{1}", server.getUser(user).getDisplayName()));
    }
}