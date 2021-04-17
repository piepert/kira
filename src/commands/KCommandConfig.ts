import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    Role, TextChannel, GuildChannel
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KRole } from "../KRole";
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";
import { KChannelConfig } from "../KChannelConfig";

export class KCommandConfig extends KCommand {
    constructor() {
        super()
        this.command_name = "config";

        this.permissions = [
            "admin.config"
        ];
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length < 2) {
            return false;
        }

        let args = cmd.getArguments();

        /**
         * feed add <feedURL> <channelID> {4}
         * feed color <feedID> <color> {4}
         * feed title <feedID> <title> {4}
         * feed delete <feedID> {3}
         * feed list [channelID] {2/3}
        */

        if (args[0] == "feed") {
            if (args[1] == "list" && args.length <= 3) {
                return true;
            } else if (args[1] == "add") {
                return args.length == 4;
            } else if (args[1] == "color") {
                return args.length == 4;
            } else if (args[1] == "title") {
                return args.length == 4;
            } else if (args[1] == "delete") {
                return args.length == 3;
            }
        }

        /**
         * language list|<language_id> {2}
        */

        if (args[0] == "language") {
            return args.length == 2;
        }

        /**
         * translation <key> <value> {3}
        */

        if (args[0] == "translation") {
            return args.length == 3 || (args.length == 2 && args[1] == "show");
        }

        /**
         * mute-role show|(set <value>) {3}
        */

        if (args[0] == "mute-role") {
            return args.length == 3 || (args.length == 2 && args[1] == "show");
        }

        /**
         * delu <user> {2}
        */

        if (args[0] == "delu") {
            return args.length == 2;
        }

        /**
         * log <channelID> {2}
        */

        if (args[0] == "log") {
            return args.length == 2;
        }

        return false;
    }

    /*
     * config feed add <feedURL> <channelID> {4}
     * config feed color <feedID> <color> {4}
     * config feed title <feedID> <title> {4}
     * config feed delete <feedID> {3}
     * config feed list [channelID] {2/3}
     *
     * config language list|<language_id> {2}
     * config translation <key> delete|<value> {3}
     * config delu <user> {2}
     * config log <channel> {2}
     */

    // d
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let args: string[] = command.getArguments();

        /**
         * feed add <channelID> <feedURL> {4}
         * feed color <feedID> <color> {4}
         * feed title <feedID> <title> {4}
         * feed delete <feedID> {3}
         * feed list [channelID] {2/3}
        */

        if (args[0] == "feed") {
            let c_feed: string = null;
            let c_channel: GuildChannel = null;

            if (args[1] == "add" || (args[1] == "list" && args.length >= 3)) {                      // check if channel exists
                let channel_id = args[2];
                c_channel = KConf.textToChannel(channel_id, msg.guild);

                if (c_channel == undefined) {
                    msg.channel.send(server.getTranslation("command.config.channel_not_found"))
                    return;
                }

                if (!c_channel.isText()) {
                    msg.channel.send(server.getTranslation("command.config.not_text_channel"))
                    return;
                }

            } else if (args[1] != "list") {                                                         // check if feed exists
                c_feed = args[2];

                if (server.getFeedByID(c_feed) == undefined) {
                    msg.channel.send(server.getTranslation("command.config.feed_not_found")
                            .replace("{1}", conf.getConfig().command_prefix))
                    return;
                }
            }

            if (args[1] == "list" && args.length <= 3) {
                if (args.length == 3) {
                    let feeds: KChannelConfig[] = server.getChannelConfigsByID(c_channel.id);

                    if (feeds == undefined) {
                        msg.channel.send(server.getTranslation("command.config.channel_not_found"))
                        return;
                    } else {
                        let list = feeds.map((e) => {
                            return ("`"+e.getConfigurationID()+"` - "+e.feed_url+" - "+e.title);
                        })

                        let message_str = server.getTranslation("command.config.list_for_channel");

                        message_str = message_str.replace("{1}", "<#"+c_channel.id+">");
                        message_str = message_str.replace("{2}", list.join("\n"));

                        msg.channel.send(message_str);
                    }
                } else {
                    let first = true;
                    for (let channel of msg.guild.channels.cache.keys()) {
                        let feeds: KChannelConfig[] = server.getChannelConfigsByID(channel);

                        if (feeds == undefined) {
                            continue;
                        } else {
                            let list = feeds.map((e) => {
                                return ("`"+e.getConfigurationID()+"` - "+e.feed_url+" - "+e.title);
                            })

                            let message_str = server.getTranslation("command.config.list_for_channel");

                            message_str = message_str.replace("{1}", "<#"+channel+">");
                            message_str = message_str.replace("{2}", list.join("\n"));

                            if (!first) {
                                message_str = "​\n\n"+message_str;                                   // NOTE: there is a zero width space char ...
                                                                                                    // ... before \n\n to print the new lines!
                            } else {
                                first = false;
                            }

                            msg.channel.send(message_str);
                        }
                    }
                }
            } else if (args[1] == "add") {
                let cc = new KChannelConfig();
                cc.channel_id = KConf.textToChannel(args[2], msg.guild).id;
                cc.feed_url = args[3];
                cc.refreshID();

                if (KConf.textToChannel(args[2], msg.guild) === undefined ||
                    !KConf.textToChannel(args[2], msg.guild).isText()) {
                    msg.channel.send(server.getTranslation("command.config.channel_not_found"))
                    return;
                }

                server.addChannelConfig(cc);
                msg.channel.send(server.getTranslation("command.config.channel_added"));

            } else if (args[1] == "color") {
                if (server.getFeedByID(args[2]) === undefined) {
                    msg.channel.send(server.getTranslation("command.config.channel_not_found"))
                    return;
                }

                if (/#[a-f0-9]{6}/.test(args[2]) === false) {
                    msg.channel.send(server.getTranslation("command.config.invalid_color").replace("{1}", args[3]))
                    return;
                }

                server.getFeedByID(args[2]).color = args[3];

            } else if (args[1] == "title") {
                if (server.getFeedByID(args[2]) === undefined) {
                    msg.channel.send(server.getTranslation("command.config.channel_not_found"))
                    return;
                }

                server.getFeedByID(args[2]).title = args[2];

            } else if (args[1] == "delete") {
                if (server.getChannelConfigs().deleteConfig(c_feed, server)) {
                    msg.channel.send(server.getTranslation("command.config.channel_deleted"));
                } else {
                    msg.channel.send(server.getTranslation("command.config.channel_deleted.error"));
                }
            }
        }

        /**
         * language list|<language_id> {2}
        */

        if (args[0] == "language") {
            args[1] = args[1].toLocaleLowerCase();

            if (args[1] == "list") {
                let langs = conf.getTranslationManager().translations.map((e) => {
                    return e.getLangCode()+"        - "+e.lang_name;
                });

                msg.channel.send("```ISO-639-1 - Language Name\n"+
                    "-------------------------\n"+
                    langs.join("\n")+
                    "```");
            } else {
                if (conf.getTranslationManager().getTranslation(args[1]) === undefined) {
                    msg.channel.send(
                        server.getTranslation("command.config.language_not_found")
                        .replace("{1}", args[1]));
                } else {
                    server.setLanguage(args[1]);

                    msg.channel.send(
                        server.getTranslation("command.config.language_changed")
                        .replace("{1}", args[1]));
                }
            }
        }

        /**
         * translation show|(<key> delete|<value>) {3/1}
        */

        if (args[0] == "translation") {
            if (args.length == 2 && args[1] == "show") {
                let msg_str = server.getTranslation("command.config.list_translations");

                for (let k in server.translations.keys()) {
                    msg_str += "**[ `"+k+"` ]** "+server.translations[k]
                }
            } else if (args[2] == "delete") {
                if (!server.deleteTranslation(args[1])) {
                    msg.channel.send(
                        server.getTranslation("command.config.translation_not_found")
                        .replace("{1}", args[1]));

                } else {
                    msg.channel.send(
                        server.getTranslation("command.config.translation_deleted")
                        .replace("{1}", args[1]));
                }
            } else {
                server.setTranslation(args[1], args[2]);
            }
        }

        /**
         * mute-role show|(set <value>) {3/1}
        */

        if (args[0] == "mute-role") {
            if (args.length == 2 && args[1] == "show") {
                msg.channel.send(
                    server.getTranslation("command.config.mute_role_show")
                    .replace("{1}", server.getMuteRoll()));

            } else if (args[1] == "set") {
                let role = await KConf.roleToID(msg.guild, args[2]);
                console.log(role);

                if (role != undefined && msg.guild.roles.cache.has(role)) {
                    server.setMuteRoll(role);

                    msg.channel.send(
                        server.getTranslation("command.config.mute_role_set")
                        .replace("{1}", args[2]));
                } else {
                    msg.channel.send(
                        server.getTranslation("command.config.mute_role_not_found")
                        .replace("{1}", args[2]));
                }
            }
        }

        /**
         * delu <user> {2}
        */

        if (args[0] == "delu") {
            let UID = await KConf.userToID(msg.guild, args[1], server);

            if (server.getUsers().getUser(UID) !== undefined) {
                if (server.getUsers().deleteUser(UID, server)) {
                    msg.channel.send(
                        server.getTranslation("command.config.user_deleted")
                        .replace("{1}", args[1]));

                } else {
                    msg.channel.send(server.getTranslation("command.config.user_deleted.error"));
                }

            } else {
                msg.channel.send(
                    server.getTranslation("command.config.user_not_found")
                    .replace("{1}", args[1]));
            }
        }

        /**
         * log <channel> {2}
         */

        if (args[0] == "log") {
            let channel: GuildChannel = KConf.textToChannel(args[1], msg.guild);

            if (channel === undefined ||
                !channel.isText()) {
                msg.channel.send(server.getTranslation("command.config.channel_not_found"))
                return;
            }

            server.setLogChannel(channel.id);
            msg.channel.send(server.getTranslation("command.config.log_set")
                .replace("{1}", "<#"+channel.id+">"));
        }
    }
}