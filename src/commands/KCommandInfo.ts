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
import { readFileSync } from "fs";

export class KCommandInfo extends KCommand {
    constructor() {
        super()
        this.command_name = "info";

        this.permissions = [
            "command.info"
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

        let sec_num = parseInt(process.uptime().toString(), 10); // don't forget the second param
        let days   = Math.floor(sec_num / 3600 / 60).toString();
        let hours   = Math.floor(sec_num / 3600).toString();
        let minutes = Math.floor((sec_num - (parseInt(hours) * 3600)) / 60).toString();
        let seconds = (sec_num - (parseInt(hours) * 3600) - (parseInt(minutes) * 60)).toString();

        let time = days+"d "+hours+"h "+minutes+"min "+seconds+"s";

        msg.channel.send({ embeds: [ new MessageEmbed()
            .setTitle(server.getTranslation("command.info.title"))
            .addFields([
                {
                    name: server.getTranslation("command.info.version"),
                    value: "v"+conf.version,
                    inline: true
                },
                {
                    name: server.getTranslation("command.info.uptime"),
                    value: time,
                    inline: true
                },
                {
                    name: server.getTranslation("command.info.node"),
                    value: process.version,
                    inline: true
                },
                {
                    name: server.getTranslation("command.info.discordjs"),
                    value: JSON.parse(readFileSync("../package.json") as any).dependencies["discord.js"],
                    inline: true
                },
                {
                    name: "GitHub",
                    value: "https://github.com/survari/kira"
                },
                {
                    name: server.getTranslation("command.info.bugs_features"),
                    value: "http://scp-int.wikidot.com/forum/c-2968533/tech-help"
                }
            ])
        ]});
    }
}