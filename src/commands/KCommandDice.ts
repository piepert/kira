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

class DiceCollection {
    faces: number;
    count: number;
    results: number[];
    calculated: number;
    malus: number;
    arg: string;
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;

    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min: number, max: number): number {
    min = min;
    max = max;

    return (Math.random() * (max - min)) + min;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

async function makeDice(faces: number, count: number, arg: string, malus: number): Promise<DiceCollection> {
    let res = [];

    while (res.length < count && count <= 10) {
        let d = new Date();
        res.push(getRandomInt(1, faces));

        while ((new Date()).valueOf() - d.valueOf() <= 100) {
            continue;
        }
    }

    return {
        faces: faces,
        count: count,
        malus: malus,
        results: res,
        calculated: res.reduce((a, b) => a + b, 0)+malus,
        arg: arg
    };
}

function arrayStringFromDice(dice: DiceCollection, result: string) {
    return [
        "┌"+"─".repeat(result.toString().length+2)+"┐",
        "│ "+result+" │",
        "└"+"─".repeat(result.toString().length+2)+"┘"
    ]
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
            || (cmd.getArguments().length == 2)
            || cmd.getArguments().map(e => {
                if (!/[0-9]*w[1-9]+[0-9]*((\+|\-)[0-9]+|)/.test(e)) {
                    e = undefined;
                    return e;
                }
            }).indexOf(undefined) >= 0;
    }

    // dice [<from> <to>]
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let dice: DiceCollection[] = [];
        for (let arg of command.getArguments()) {
            let nwn_n: RegExp = /([1-9]+[0-9]*)(w|d)([1-9]+[0-9]*)([\+\-][0-9]+)/;
            let nwn: RegExp = /([1-9]+[0-9]*)(w|d)([1-9]+[0-9]*)/;
            let wn_n: RegExp = /(w|d)([1-9]+[0-9]*)([\+\-][0-9]+)/;
            let wn: RegExp = /(w|d)([1-9]+[0-9]*)/;

            if (nwn_n.test(arg)) {
                let match = nwn_n.exec(arg);

                if (Math.abs(parseInt(match[3])) > 1000000) {
                    msg.channel.send(server.getTranslation("command.dice.interdimensional"));
                    return;
                }

                dice.push(await makeDice(
                    parseInt(match[3]),
                    parseInt(match[1]),
                    arg,
                    parseInt(match[4])));

            } else if (nwn.test(arg)) {
                let match = nwn.exec(arg);

                if (Math.abs(parseInt(match[3])) > 1000000) {
                    msg.channel.send(server.getTranslation("command.dice.interdimensional"));
                    return;
                }

                dice.push(await makeDice(
                    parseInt(match[3]),
                    parseInt(match[1]),
                    arg,
                    0));

            } else if (wn_n.test(arg)) {
                let match = wn_n.exec(arg);

                if (Math.abs(parseInt(match[2])) > 1000000) {
                    msg.channel.send(server.getTranslation("command.dice.interdimensional"));
                    return;
                }

                dice.push(await makeDice(
                    parseInt(match[2]),
                    1,
                    arg,
                    parseInt(match[3])));

            } else if (wn.test(arg)) {
                let match = wn.exec(arg);

                if (Math.abs(parseInt(match[2])) > 1000000) {
                    msg.channel.send(server.getTranslation("command.dice.interdimensional"));
                    return;
                }

                dice.push(await makeDice(
                    parseInt(match[2]),
                    1,
                    arg,
                    0));
            }
        }

        let dice_count: number = dice.reduce((a, b) => a + b.count, 0);

        if (dice.length != 0) {
            if (dice_count > 10) {
                msg.channel.send(server.getTranslation("command.dice.too_many_dice"));
                return;
            }

            let message = "<@!"+msg.author.id+">\n";

            for (let d of dice) {
                // let template = "```\n{s}┌{b}┐\n{n}│ {r} │\n{s}└{b}┘```";
                /*
                let name = (dice.count < 2 ? "" : dice.count)
                    + (dice.arg.includes("w") ? "w" : "d")
                    + dice.to + (dice.from > 0
                        ? "+"+dice.from
                        : (dice.from == 1
                            ? ""
                            : dice.from.toString()));
                */

                let message_array = [ "`", "`", "`" ];

                for (let result of d.results) {
                    if (result < 1) {
                        result = 1;
                    } else if (result > d.faces) {
                        result = d.faces;
                    }

                    let r_arr = arrayStringFromDice(d, result.toString());

                    message_array[0] += r_arr[0]+" ";
                    message_array[1] += r_arr[1]+" ";
                    message_array[2] += r_arr[2]+" ";
                }

                message_array[0] += "`";
                message_array[1] += "`";
                message_array[2] += "`";

                let malus = d.malus < 0
                    ? " - "+(d.malus * -1).toString()
                    : " + "+d.malus.toString();

                message += "**`"
                    + d.arg
                    + "`**`"+"─".repeat(30-d.arg.length)
                    + "` (max. `"+(d.count*d.faces).toString()+malus
                    + "` → max. `"+(d.count*d.faces+d.malus).toString()+"`)"
                    //+ "\n```\n"
                    + "\n"+message_array.join("\n")
                    //+ "\n```"
                    +"\n`"+(d.calculated-d.malus)+malus+"` =`"
                    +d.calculated+"`\n\n";
            }

            msg.channel.send(message);
            return;
        }

        let min = 1;
        let max = 6;

        if (command.getArguments().length == 2) {
            if (!isNumeric(command.getArguments()[0]) ||
                !isNumeric(command.getArguments()[0])) {

                msg.channel.send(server.getTranslation("command.dice.only_numbers"));
                return;
            }

            min = parseFloat(command.getArguments()[0]);
            max = parseFloat(command.getArguments()[1]);
        }

        if (min > max) {
            msg.channel.send(server.getTranslation("command.dice.min_too_big"));
            return;
        }

        if ((min.toString()+"_"+max.toString()).indexOf('.') == -1) {                               // check if one of them is an integer
            msg.channel.send(getRandomInt(min, max).toString());                                    // ... if yes, generate random int
        } else {
            msg.channel.send((Math.floor(getRandomFloat(min, max)*100) / 100).toString());          // ... if no, generate random float
        }
    }
}