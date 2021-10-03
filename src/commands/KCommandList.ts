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
import { table } from "table";

export class KCommandList extends KCommand {
    constructor() {
        super()
        this.command_name = "list";

        this.permissions = [
            "admin.list"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length != 1 && cmd.getArguments().length != 2) {
            return false;
        }

        if (![ "roles", "r",
               "users", "u",
               "channels", "c" ].includes(cmd.getArguments()[0])) {
            return false;
        }

        if (cmd.getArguments().length == 2
            && ![ "sort_by:id",
                  "sort_by:name",
                  "sort_by:entries" ].includes(cmd.getArguments()[1])) {
            return false;
        }

        return true;
    }

    /*
    *
    * !list roles|r sort_by:<id|name>
    * !list users|u sort_by:<id|name|entries>
    * !list channels|c sort_by:<id|name>
    *
    */

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let sort = "id";
        let list = [];

        let header = [
            "ID",
            conf.getTranslationStr(msg, "command.user.name")
        ];

        if (command.getArguments().length == 2) {
            sort = command.getArguments()[1].replace("sort_by:", "");
        }

        if ([ "c", "channels" ].includes(command.getArguments()[0])) {
            if (sort == "entries") {
                sort = "id";
            }

            for (let channel of (await client.guilds.cache.get(server.getID()).channels.cache.values())) {
                if (channel.type == "text") {
                    list.push([
                        channel.id,
                        channel.name
                    ])
                }
            }

        } else if ([ "u", "users" ].includes(command.getArguments()[0])) {
            header.push(conf.getTranslationStr(msg, "command.user.entries"));

            for (let user of server.getUsers().getUsers()) {
                list.push([
                    user.getID(),
                    user.getDisplayName(),
                    user.getEntries().getEntries().length
                ])
            }

        } else if ([ "r", "roles" ].includes(command.getArguments()[0])) {
            if (sort == "entries") {
                sort = "id";
            }

            for (let role of (await client.guilds.cache.get(server.getID()).roles.cache.values())) {
                list.push([
                    role.id,
                    role.name
                ])
            }
        }

        if (sort == "id") {
            list = list.sort((a, b) => {
                if (a[0] < b[0]) {
                    return -1;
                }

                if (a[0] > b[0]) {
                    return 1;
                }

                return 0;
            });
        } else if (sort == "name") {
            list = list.sort((a, b) => a[1].localeCompare(b[1]));

        } else if (sort == "entries") {
            list = list.sort((a, b) => {
                if (a[2] < b[2]) {
                    return -1;
                }

                if (a[2] > b[2]) {
                    return 1;
                }

                return 0;
            });
        }

        msg.channel.send("```"+table([header].concat(list))+"```")
    }
}