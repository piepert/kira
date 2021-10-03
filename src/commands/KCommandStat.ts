import {
    Message,
    MessageEmbed,
    GuildMember,
    User, TextChannel, Guild
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";
import { table } from "table";

export class KCommandStat extends KCommand {
    constructor() {
        super()
        this.command_name = "stat";

        this.permissions = [
            "admin.stat"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length != 0 &&
                cmd.getArguments()[0] != "or");
    }

    public existsFilter(name: string): boolean {
        return [
            "messages_count",
            "last_message",
            "has_permission",
            "has_role",
            "member_since",
            "banned",
            "entry_count"
        ].indexOf(name) >= 0;
    }

    public timeStringToDate(time_str: string): Date {
        let unix_timestamp = ((new Date()).valueOf() / 1000);
        let str = "";
        const day_length = 86400; // in seconds

        for (let char of time_str) {
            switch (char) {
                case "d":
                    unix_timestamp -= day_length * parseInt(str);
                    str = "";
                    break;

                case "w":
                    unix_timestamp -= day_length*7 * parseInt(str);
                    str = "";
                    break;

                case "m":
                    unix_timestamp -= day_length*31 * parseInt(str);
                    str = "";
                    break;

                case "y":
                    unix_timestamp -= day_length*365 * parseInt(str);
                    str = "";
                    break;

                default:
                    str += char;
            }
        }

        return new Date(unix_timestamp * 1000);
    }

    public compareObjectsToNum(a, b): number {
        if (a == b)
            return 0;           // ==
        else if (a < b)
            return -1;          // <
        else
            return 1;           // >
    }

    public operandToComparationNum(a) {
        switch (a) {
            case "<": return -1;
            case ">": return 1;
            case ":": return 0;
            default: return null;
        }
    }

    public async performQuery(query_list: any[],
        users: KUser[],
        guild: Guild,
        query: any = undefined): Promise<KUser[]> {

        if (query == undefined) {
            query = query_list.shift();
        }

        let inverted: boolean = query.name.startsWith("!");
        let bans = await guild.fetchBans();

        if (inverted) {
            query.name = query.name.substring(1, query.name.length);
        }

        // last_message        Time (h,d,w,m,y)        Last message in Time
        if (query.name == "last_message") {
            users = users.map(user => {
                let a = this.timeStringToDate(query.value);
                let b = new Date(user.getLastMessageDate());

                if (a > b ||
                    (user.getLastMessageDate() == "never" &&
                    query.value != "never")) {

                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        // messages_count      Number                  Message count <,>,: Number
        else if (query.name == "messages_count") {
            users = users.map(user => {
                if (this.compareObjectsToNum(user.getMessageCount(), parseInt(query.value))
                    != this.operandToComparationNum(query.operand)) {

                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        // messages_count      Number                  Message count <,>,: Number
        else if (query.name == "has_no_role") {
            users = users.map(user => {
                if (guild.members.cache.get(user.id).roles.cache.size > 1) {

                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        // has_permission      Permission-String       Has Permission-String
        else if (query.name == "has_permission") {
            users = users.map(user => {
                if (!user.canPermission(query.value)) {

                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        // has_role            Role-ID                 Has Role-ID
        else if (query.name == "has_role") {
            users = users.map(user => {
                if (guild.members
                    .cache
                    .get(user.getID()) == undefined) {

                    return undefined;
                }

                if (!guild.members
                        .cache
                        .get(user.getID()).roles
                            .cache
                            .has(query.value)) {

                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        // member_since        Time (h,d,w,m,y)        Member date in Time
        else if (query.name == "member_since") {
            users = users.map(user => {
                let a = this.timeStringToDate(query.value);
                let b = new Date(user.getJoinDate());

                /*
                if (a > b ||
                    (user.getJoinDate() == "never" &&
                    query.value != "never")) {
                */

                if (this.compareObjectsToNum(a, b)
                        != this.operandToComparationNum(query.operand) ||
                    (user.getLastMessageDate() == "never" &&
                        query.value != "never")) {

                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        // banned
        else if (query.name == "banned") {
            users = (users.map(user => {
                if (bans.has(user.getID())) {
                    return (inverted ? undefined : user);
                }

                return (!inverted ? undefined : user);
            }));
        }

        // entry_count        Number                  Message count <,>,: Number
        else if (query.name == "entry_count") {
            users = users.map(user => {
                let a = user.getEntries().getEntries().length;
                let b = parseInt(query.value);

                if (this.compareObjectsToNum(a, b) != this.operandToComparationNum(query.operand)) {
                    if (inverted) return user;
                    user = undefined;
                }

                return (inverted ? undefined : user);
            });
        }

        while (users.indexOf(undefined) >= 0) {
            users.splice(users.indexOf(undefined), 1);
        }

        if (query_list.length == 0) {
            return users;
        }

        query = query_list.shift();
        return this.performQuery(query_list, users, guild, query);
    }

    public createQueryTree(args: string[]): any[][] {
        let queries = [];
        let tmp_query = [];

        for (let filter of args) {
            filter = filter.toLocaleLowerCase();

            if (filter == "or") {
                queries.push(tmp_query);
                tmp_query = [];
                continue;
            }

            let splitted = filter.split(":");
            let o = {
                name: null,
                value: null,
                operand: ":"
            };

            if (filter == "has_no_role") {
                tmp_query.push({
                    name: "has_no_role",
                    value: "has_no_role",
                    operand: ":"
                });
                continue;
            }

            if (splitted.length != 2) {
                o.operand = "<";
                splitted = splitted[0].split("<");

                if (splitted.length != 2) {
                    o.operand = ">";
                    splitted = splitted[0].split(">");

                    if (splitted.length != 2) {
                        console.log("[ DEBUG ] Stat Err 1");
                        return null;
                    }
                }
            }

            o.name = splitted[0];
            o.value = splitted[1];

            if (!this.existsFilter(o.name) && !this.existsFilter(o.name.substring(1, o.name.length))) {
                console.log("[ DEBUG ] Stat Err 2");
                return null;
            }

            tmp_query.push(o);
        }

        queries.push(tmp_query);
        return queries;
    }

    /*
        !state filter1:arg1 filter2:arg2 or filter1:arg1 filter3:arg3 or ...
        Everything without "or" is automatically connected by "and".

        Filter              Value                   Explanation
        ----------------------------------------------------------------------------
        last_message        Time (h,d,w,m,y)        Last message in Time
        messages_count      Number                  Message count <,>,: Number
        has_permission      Permission-String       Has Permission-String
        has_role            Role-ID                 Has Role-ID
        member_since        Time (h,d,w,m,y)        Member date in Time
        has_no_role         -                       Checks if the member has no role
    */
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        await server.refreshUsers(msg.guild);

        const user_list = server.getUsers().getUsers();
        let queries: any[][] = this.createQueryTree(command.getArguments());
        let result: KUser[] = [];

        if (queries == null) {
            msg.channel.send(server.getTranslation("command.stat.error"));
            return;
        }

        for (let query of queries) {
            result = result.concat(await this.performQuery(query,
                    user_list,
                    client.guilds.cache.get(server.getID())));
        }

        result = result.filter(
            (v, i, a) => a.findIndex(t => (t.getID() === v.getID())) === i);

        if (result.length == 0) {
            msg.channel.send(server.getTranslation("command.stat.nothing_found"));
            return;
        }

        let user_table = [
            [
                server.getTranslation("command.stat.name"),
                "ID"
            ]
        ];

        for (let u of result) {
            user_table.push([ u.getDisplayName(), u.getID() ]);
        }

        let output = table(user_table);
        let outputs = output.split("\n");
        let message = "```";
        let messages = [];

        for (let s of outputs) {
            if (message.length+s.length+4 < 2000) {
                message += s + "\n";
            } else {
                messages.push(message+"```");
                message = "```"+s+"\n";
            }
        }

        messages.push(message+"```");

        let interval = setInterval((messages) => {
            msg.channel.send(messages.shift());

            if (messages.length == 0) {
                clearInterval(interval);
            }
        }, 1000, messages);
    }
}