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
import { KCommandManager } from "../KCommandManager";
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";
import { KPatcher } from "../KPatcher";

export class KCommandPatch extends KCommand {
    constructor() {
        super()
        this.command_name = "patch";

        this.permissions = [
            "OPERATOR"
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

        msg.channel.send("Starting patch now...");
        KPatcher.patch(msg.channel as TextChannel,
            command.getArguments()[0],
            conf);
    }
}