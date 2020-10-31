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

export class KCommandRefresh extends KCommand {
    constructor() {
        super()
        this.command_name = "refresh";

        this.permissions = [
            "admin.refresh"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser) {

        let count_b = server.users.users.length;

        server.refreshUsers(msg.guild).then(() => {
            let c = server.users.users.length - count_b;

            if (c == 1) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.refresh.refreshed_sg")
                        .replace("{1}",(c).toString()));
            } else {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.refresh.refreshed_pl")
                        .replace("{1}", (c).toString()));
            }
        });
    }
}