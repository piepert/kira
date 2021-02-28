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
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";
import { readdirSync } from "fs";

export class KCommandGetLog extends KCommand {
    constructor() {
        super()
        this.command_name = "get_log";

        this.permissions = [
            "OPERATOR"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return cmd.getArguments().length == 1;
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let d = new Date();

        if (command.getArguments()[0] == "current") {
            let file_name = "KIRA_log_"+ ("0" + d.getDate().toString()).slice(-2) +
                "." + ("0" + (d.getMonth()+1).toString()).slice(-2) +
                "." + d.getFullYear() + ".log";

            msg.author.createDM().then(c => c.send("Current log.", { files: [
                "logs/"+file_name,
                "error_log.txt"
            ] }));

            return;
        }

        if (command.getArguments()[0] == "last") {
            let files = readdirSync("logs/");
            let attachments_objects = [];

            for (let index in files) {                                                              // iterate through all files in directory
                let date = files[index].replace("KIRA_log_", "").replace(".log", "");

                // create date string by parsing the date in the file name
                //   * split the numbers, take the first three (dd.mm.yyyy)
                //   * reverse them, add leading 0 and make them yyyy-mm-dd
                //   * take the last element (hh_mm_ss)
                //   * split, add leading 0 and join them to hh:mm:ss
                // dd.mm.yyyy.hh_mm_ss -> yyyy-mm-dd hh:mm:ss
                date = date.split(".")
                        .slice(0, 3)
                        .map(e => {
                            if (parseInt(e) < 10 && parseInt(e) >= 0) {
                                e = "0"+parseInt(e);
                            }

                            return e;
                        })
                        .reverse()
                        .join("-");

                let d = new Date(date);
                attachments_objects.push({ file: "logs/"+files[index], date: d });
            }

            attachments_objects = attachments_objects.sort((a, b) => (a.date - b.date)).map(e => {
                e.date = undefined;
                delete e.date;

                return e.file;
            }).reverse().slice(0, 3);

            attachments_objects.push("error_log.txt");

            msg.author.createDM().then(channel => {
                if (attachments_objects.length == 0) {
                    channel.send("No logs found.");
                    return;
                }

                channel.send("Last 3 logs.", { files: attachments_objects })
            });

            return;
        }

        let file_name_part = "KIRA_log_"+command.getArguments()[0];
        let files = readdirSync("logs/");
        let attachments = [];

        for (let index in files) {                                                                  // iterate through all files in directory
            if (files[index].startsWith(file_name_part)) {
                attachments.push("logs/"+files[index]);
            }
        }

        attachments.push("error_log.txt");
        msg.author.createDM().then(channel => {
            if (attachments.length == 0) {
                channel.send("No logs found.");
                return;
            }

            channel.send("Logs from "+command.getArguments()[0]+".", { files: attachments })
        })
    }
}