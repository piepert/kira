import { Client, Message, MessageEmbed } from "discord.js";
import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KCommandManager } from "../KCommandManager";
import { KUser } from "../KUser";

export class KCommandActivate extends KCommand {
    constructor() {
        super()
        this.command_name = "activate";

        this.permissions = [
            "admin.activate"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        if (KCommandManager.getCommand(command.getArguments()[0]) != undefined) {
            server.activateCommand(command.getArguments()[0]);
            msg.channel.send(server.getTranslation("commands.activate.activated"));
        } else {
            msg.channel.send(server.getTranslation("commands.activate.command_not_found"));
        }
    }
}