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

function getRandomFloat(min: number, max: number) {
    min = min;
    max = max;

    return (Math.random() * (max - min)) + min;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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

        if (command.getArguments().length == 2) {
            if (!isNumeric(command.getArguments()[0]) ||
                !isNumeric(command.getArguments()[0])) {

                msg.channel.send(conf.getTranslationStr(msg, "command.dice.only_numbers"));
                return;
            }

            min = parseFloat(command.getArguments()[0]);
            max = parseFloat(command.getArguments()[1]);
        }

        if (min > max) {
            msg.channel.send(conf.getTranslationStr(msg, "command.dice.min_too_big"));
            return;
        }

        if ((min.toString()+"_"+max.toString()).indexOf('.') == -1) {                               // check if one of them is an integer
            msg.channel.send(getRandomInt(min, max));                                               // ... if yes, generate random int
        } else {
            msg.channel.send(Math.floor(getRandomFloat(min, max)*100) / 100);                       // ... if no, generate random float
        }
    }
}