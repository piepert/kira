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

export class KCommandThanks extends KCommand {
    constructor() {
        super()
        this.command_name = "thanks";

        this.permissions = [
            "command.thanks"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        if (command.getArguments().length == 1) {
            let is_kira = command.getArguments()[0]
                .toLocaleLowerCase()
                .trim()
                .replace("!", "")
                .replace(".", "")
                .replace("?", "") == "kira"

            if (is_kira) {
                let thanks = conf.getTranslationStr(msg, "command.help.ywc");
                msg.channel.send(thanks[Math.floor(Math.random() * thanks.length)]);
                return;
            }
        }

        if (command.getArguments().length == 0) {

            let thanks = conf.getTranslationStr(msg, "command.help.ywc");
            msg.channel.send(thanks[Math.floor(Math.random() * thanks.length)]);

        } else {
            let text = command.getArguments().join(" ");
            let thanks = conf.getTranslationStr(msg, "command.help.thanks");

            msg.channel
                .send(thanks[Math.floor(Math.random() * thanks.length)]
                .replace("{1}", text));
        }
    }
}