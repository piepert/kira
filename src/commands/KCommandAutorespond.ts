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

export class KCommandAutorespond extends KCommand {
    constructor() {
        super()
        this.command_name = "autorespond";

        this.permissions = [
            "admin.autorespond"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length >= 2) {
            return cmd.arguments[0] == "del" ||
                cmd.arguments[0] == "add";
        } else if (cmd.getArguments().length == 1) {
            return cmd.getArguments()[0] == "list";
        }

        return false;
    }

    // !autorespond add <key> <value>
    // !autorespond del <key>
    // !autorespond list
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let words = command.arguments.splice(1, command.arguments.length-1);

        if (command.arguments[0] == "del") {
            let word = words.join(" ");

            if (!server.hasAutorespond(word)) {
                msg.channel.send(server.getTranslation("command.autorespond.not_found"));
                return;
            }

            server.removeAutorespond(words.join(" "))

            msg.channel.send(server.getTranslation("command.autorespond.deleted"));
        } else if (command.arguments[0] == "add") {
            let key = words.shift();
            let value = words.join(" ");

            if (!server.hasAutorespond(key)) {
                server.addAutorespond(key, value);

                msg.channel.send(server.getTranslation("command.autorespond.added"));
            } else {
                msg.channel.send(server.getTranslation("command.autorespond.already_exists"));
            }
        } else {
            if (server.autoresponds.size == 0) {
                msg.channel.send(server.getTranslation("command.autorespond.empty"));
                return;
            }

            let part = "";

            for (let key of server.autoresponds.keys()) {
                let line = "`"+key+"`: "+server.autoresponds.get(key)+"\n\n";

                if (part.length+line.length < 2000) {
                    part += line;
                } else {
                    msg.channel.send(part.trim());
                    part = "";
                }
            }

            msg.channel.send(part.trim());
        }
    }
}