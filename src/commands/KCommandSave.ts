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
import { KUser } from "../KUser";

export class KCommandSave extends KCommand {
    constructor() {
        super()
        this.command_name = "save";

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

        conf.saveServer(conf.getServerManager().getServerByID(server.getID()), false);
        msg.channel.send(server.getTranslation("command.save.start"));
    }
}