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
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";

export class KCommandJoke extends KCommand {
    constructor() {
        super()
        this.command_name = "joke";
        this.frequency_minutes = 5;
        this.frequency_max = 1;

        this.permissions = [
            "command.joke"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length == 0);
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let joke = await conf.getTranslationManager()
            .getRandomJoke(server.getLanguage());

        if (joke == undefined) {
            joke = conf.getTranslationStr(msg, "command.joke.not_found");
        }

        msg.channel.send(joke);
    }
}