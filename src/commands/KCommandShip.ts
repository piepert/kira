import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    TextChannel,
    Client
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";

function hasVowel(c) {
    const vowels = "aeyiouàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";

    for (let v of vowels.split("")) {
        if (c.split("").includes(v)) {
            return true;
        }
    }

    return false;
}

export class KCommandShip extends KCommand {
    constructor() {
        super()
        this.command_name = "ship";

        this.permissions = [
            "command.ship"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length == 2);
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let temp = "";
        let all_parts: string[][] = [];

        for (let name of command.getArguments()) {
            let parts = [];

            if (name.length < 3) {
                all_parts.push([ name ]);
                continue;
            }

            for (let c of name) {
                if (hasVowel(c)) {
                    if ((temp.length != 0 || parts.length == 0)
                        && (name.startsWith(temp) || name.endsWith(temp))) {
                        parts.push(temp);
                    }

                    parts.push(temp+c);
                    temp = "";
                } else {
                    temp += c;
                }
            }

            if (temp.length != 0) {
                parts.push(temp);
            }

            all_parts.push(parts);
            temp = "";
        }

        /*
        for (let parts of all_parts) {
            for (let part of parts) {
                if (part.length == 1) {
                    return
                }
            }
        }*/

        let a = "";
        let b = "";
        let type = Math.floor(Math.random() * 10) % 2 == 0;

        if (command.getArguments()[0].length <= 2) {
            a = command.getArguments()[0];
            a = type ? a : a.toLocaleLowerCase();
        } else if (all_parts[0].length < 2) {
            a = all_parts[0][0];
        } else {
            if (type) {
                a = all_parts[0].splice(1)[0];
            } else {
                while (command.getArguments()[0].startsWith(all_parts[0][0])) {
                    all_parts[0].shift();
                }

                a = all_parts[0].join("");
            }
        }

        if (command.getArguments()[0].length <= 2) {
            b = command.getArguments()[1];
            b = type ? b.toLocaleLowerCase() : b;
        } else if (all_parts[1].length < 2) {
            b = all_parts[1][0];
        } else {
            if (type) {
                while (command.getArguments()[1].startsWith(all_parts[1][0])) {
                    all_parts[1].shift();
                }

                b = all_parts[1].join("");
            } else {
                b = all_parts[1].splice(1)[0];
            }
        }

        msg.channel.send(type ? a+b : b+a);

        setTimeout(() => {
            let t_name = command.getArguments().map(e => e.trim().toLocaleLowerCase());

            if (t_name.includes("kai") || t_name.includes("kira")) {
                let jealous = server.getTranslation("command.ship.jealous");
                let kk = server.getTranslation("command.ship.kira_kai");

                if (t_name.includes("kai") && !t_name.includes("kira")) {
                    msg.channel.send(jealous == undefined || jealous.length == 0
                        ? "ಠ_ಠ"
                        : jealous[Math.floor(Math.random() * jealous.length)]);

                } else if (t_name.includes("kai") && t_name.includes("kira")) {
                    msg.channel.send(kk == undefined || kk.length == 0
                        ? "|ω・）"
                        : kk[Math.floor(Math.random() * kk.length)]);
                }
            }
        }, 2000);
    }
}