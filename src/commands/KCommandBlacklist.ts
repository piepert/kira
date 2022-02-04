import { Client, Message, MessageEmbed } from "discord.js";
import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KCommandManager } from "../KCommandManager";
import { KUser } from "../KUser";

export class KCommandBlacklist extends KCommand {
    constructor() {
        super()
        this.command_name = "blacklist";

        this.permissions = [
            "admin.blacklist"
        ]
    }

    // !blacklist add <regex>
    // !blacklist remove <nr>
    // !blacklist list
    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length == 0) {
            return false;
        }

        if (cmd.getArguments()[0] == "list") {
            return cmd.getArguments().length == 1;
        } else if (cmd.getArguments()[0] == "remove") {
            return cmd.getArguments().length == 2 && /[0-9]+/.test(cmd.getArguments()[1]);
        } else if (cmd.getArguments()[0] == "add") {
            return cmd.getArguments().length >= 2;
        }

        return false;
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        if (command.getArguments()[0] == "add") {
            let str = command.getArguments()
                .splice(1, command.getArguments().length-1)
                .join(" ");

            server.addRegexToBlacklist(str);

        } else if (command.getArguments()[0] == "remove") {
            let num = parseInt(command.getArguments()[1]);

            if (num < 0 || num >= server.getBlacklist().length) {
                msg.channel.send(conf.getTranslationStr(msg, "command.blacklist.not_found")
                    .replace("{1}", num));

                return;
            }

            msg.channel.send(conf.getTranslationStr(msg, "command.blacklist.removed")
                .replace("{1}", server.getBlacklist()[num]));

            server.removeBlacklist(num);

        } else if (command.getArguments()[0] == "list") {
            if (server.getBlacklist().length == 0) {
                msg.channel.send(conf.getTranslationStr(msg, "command.blacklist.empty_blacklist"));
                return;
            }

            let str = "```";

            for (let i = 0; i < server.getBlacklist().length; i++) {
                let line = "["+i+"] "+server.getBlacklist()[i]+"\n";

                if (str.length+line.length+3 > 2000) {
                    msg.channel.send(str+"```");
                    str = "```";
                }

                str += line;
            }

            msg.channel.send(str+"```");
        }
    }
}