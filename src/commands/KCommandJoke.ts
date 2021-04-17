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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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

        if (server.getJokeCache() == undefined ||
            server.getJokeCache().length == 0) {

            let jokes = await conf.getTranslationManager()
                .getJokes(server.getLanguage());

            if (jokes == undefined || jokes.length == 0) {
                msg.channel.send(server.getTranslation("command.joke.not_found"));
                return;
            }

            shuffleArray(jokes);
            server.setJokeCache(jokes);
        }

        msg.channel.send(server.getJokeCache().shift());
    }
}