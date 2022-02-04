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

export class KCommandHelp extends KCommand {
    constructor() {
        super()
        this.command_name = "help";

        this.permissions = [
            "command.help"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return cmd.getArguments().length < 2;
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        // https://i.stack.imgur.com/uHmpJ.png
        // syntax:
        //      !help           - show every command (see picture)
        //      !help <command> - detailed description

        let prefix = conf.getConfig().command_prefix;
        let user = server.getUser(msg.author.id);

        if (command.getArguments().length == 0 ||
            command.getArguments()[0] == "all") {

            let embed = new MessageEmbed()
                .setColor("#6fdefc")
                .setTitle(server.getTranslation("command.help.list.title"));

            for (let c of KCommandManager.commands) {
                if (user.canPermissionsOR(c.getPermissions()) ||
                    conf.userIsOperator(user.id) ||
                    command.getArguments()[0] == "all") {

                    if (c.getPermissions().includes("OPERATOR") &&
                        !conf.userIsOperator(user.id) ||
                        server.isCommandDeactivated(c.getName())) {

                        continue;
                    }

                    let command_help = server.getTranslation("command.help.command."+c.getName());

                    let names = server.getAliasesForCommand(
                            c.getName());

                    let name = prefix+c.getName()+
                        (names.length > 0 ? " (" : "")+
                        names.map(e => prefix+e)
                            .join(", ")+
                        (names.length > 0 ? ")" : "");

                    if (command_help == undefined) {
                        embed.addField(name,
                            server.getTranslation("command.help.no_help_found"));
                        continue;
                    }

                    embed.addField(name, command_help
                        .std
                        .replace("{p}", prefix));
                }
            }

            msg.channel.send({ embeds: [ embed ] });
            msg.channel.send(server.getTranslation("command.help.list.footer")
                    .replace("{1}", prefix))

        } else if (command.getArguments().length == 1) {
            let name = command.getArguments()[0];

            if (server.getAlias(name) != undefined) {
                name = server.getAlias(name);
            }

            let c: KCommand = KCommandManager.getCommand(name);

            if (c == undefined) {
                msg.channel.send(server.getTranslation("command.help.no_help_found"))
                return;

            } else {
                let command_help = server.getTranslation("command.help.command."+c.getName());

                if (command_help == undefined ||
                    command_help.subcommands == undefined) {

                    msg.channel.send(server.getTranslation("command.help.no_help_found"))
                    return;

                }

                let embed = new MessageEmbed()
                    .setColor("#6fdefc")
                    .setTitle(server.getTranslation("command.help.sub.title")
                            .replace("{1}", prefix)
                            .replace("{2}", c.getName()));

                for (let help of command_help.subcommands) {
                    embed.addField(help.syntax
                        .replace("{p}", prefix)
                        .replace("{c}", command.getArguments()[0]),

                        help.help
                            .replace("{p}", prefix)
                            .replace("{c}", command.getArguments()[0]));
                }

                msg.channel.send({ embeds: [ embed ] });
            }
        }
    }
}