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
        sender: KUser) {

        conf.saveServer(server.id);
        msg.channel.send(conf.getTranslationStr(msg, "command.save.start"));
    }
}