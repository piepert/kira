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
import { Client } from "@typeit/discord/Client";

export class KCommandReload extends KCommand {
    constructor() {
        super()
        this.command_name = "reload_hard";

        this.permissions = [
            "OPERATOR"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {
        msg.channel.send(server.getTranslation("command.reload.start"));

        conf.reload().then(() => {
            msg.channel.send(server.getTranslation("command.reload.finished"));
        });
    }
}