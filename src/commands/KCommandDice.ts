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

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;

    return Math.floor(Math.random() * (max - min)) + min;
}

export class KCommandDice extends KCommand {
    constructor() {
        super()
        this.command_name = "dice";

        this.permissions = [
            "command.dice"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length == 0)
            || (cmd.getArguments().length == 2);
    }

    // dice [<from> <to>]
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let min = 1;
        let max = 6;

        if (command.getArguments().length == 2
            && /[1-9]+[0-9]*/.test(command.getArguments()[0])
            && /[1-9]+[0-9]*/.test(command.getArguments()[1])) {

            min = parseInt(command.getArguments()[0]);
            max = parseInt(command.getArguments()[1]);
        }

        msg.channel.send(getRandomInt(min, max));
    }
}