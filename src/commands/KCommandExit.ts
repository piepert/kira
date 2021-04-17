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

export class KCommandExit extends KCommand {
    constructor() {
        super()
        this.command_name = "exit_hard";

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

        msg.channel.send(server.getTranslation("command.exit")).then((message) => {
            conf.save(client, false);
            process.exit(0);
        });
    }
}