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

export class KCommandReloadServer extends KCommand {
    constructor() {
        super()
        this.command_name = "reload";

        this.permissions = [
            "admin.reload"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser) {

        msg.channel.send(conf.getTranslationStr(msg, "command.reload.start"));
        conf.getServerManager().getServerByID(msg.guild.id).reloadConfig();
        msg.channel.send(conf.getTranslationStr(msg, "command.reload.finished"));
    }
}