import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";
import { Client, Message } from "discord.js";

export class KCommandWelcome extends KCommand {
    constructor() {
        super()
        this.command_name = "welcome";

        this.permissions = [
            "command.welcome"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let welcome: string[] = server.getTranslation("command.help.welcome") as string[];

        if (command.getArguments().length == 0) {
            welcome = welcome.filter(e => !e.includes("{1}"));
            msg.channel.send(welcome[Math.floor(Math.random() * welcome.length)]);

        } else {
            msg.channel.send(welcome[Math.floor(Math.random() * welcome.length)]
                .replace("{1}", command.getArguments().join(" ")));
        }
    }
}