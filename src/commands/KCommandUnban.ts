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
import { Client } from "@typeit/discord/Client";

export class KCommandUnban extends KCommand {
    constructor() {
        super()
        this.command_name = "unban";

        this.permissions = [
            "admin.unban"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length == 1);
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
                .getTranslationStr(msg, "command.ban.user_not_found")
                .replace("{1}", command.getArguments()[0]));
            return;
        }

        msg.guild.members.unban(user);
        // console.log((await msg.guild.members.fetch()).filter((e) => e.user.id == user));

        // KIRA can't send messages to banned users, because they aren't on the server
        /* await msg.guild.members.resolve(user)
            .send(conf.getTranslationStr(msg, "command.unban.user_msg")
                .replace("{1}", msg.guild.name)); */

        msg.channel.send(conf
            .getTranslationStr(msg, "command.unban.unbanned")
            .replace("{1}", server.getUser(user).getDisplayName()));
    }
}