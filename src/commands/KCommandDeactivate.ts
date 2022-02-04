import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    Client
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KCommandManager } from "../KCommandManager";
import { KUser } from "../KUser";

export class KCommandDeactivate extends KCommand {
    constructor() {
        super()
        this.command_name = "deactivate";

        this.permissions = [
            "admin.deactivate"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        if (KCommandManager.getCommand(command.getArguments()[0]) != undefined) {
            server.deactivateCommand(command.getArguments()[0]);
            msg.channel.send(server.getTranslation("commands.deactivate.deactivated"));
        } else {
            msg.channel.send(server.getTranslation("commands.deactivate.command_not_found"));
        }
    }
}