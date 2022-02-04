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

export class KCommandPing extends KCommand {
    constructor() {
        super()
        this.command_name = "ping";

        this.permissions = [
            "command.ping"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length == 0);
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        msg.channel.send("Pong!");
    }
}