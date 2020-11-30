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

export class KCommandHelp extends KCommand {
    constructor() {
        super()
        this.command_name = "help";

        this.permissions = [
            "command.help"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        // https://i.stack.imgur.com/uHmpJ.png
        // syntax:
        //      !help           - show every command (see picture)
        //      !help <command> - detailed description

        msg.channel.send("Wow, such a crazy emptiness! Wow patch-magic!")
        console.log("HELP COMMAND NOT FINISHED!")
    }
}