import {
    Message,
    MessageEmbed,
    GuildMember,
    User
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { config } from "process";
import { KServer } from "../KServer";
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";

export class KCommandUser extends KCommand {
    constructor() {
        super()
        this.command_name = "user";
        this.permissions = [
            "admin.user"
        ];
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length != 1 &&
            cmd.getArguments().length != 2 &&
            cmd.getArguments().length != 3) {                                                       // check for command syntax !user
            return false;
        }

        if (cmd.getArguments().length == 3 && cmd.getArguments()[1] != "show") {
            return false;
        }

        if (cmd.getArguments().length == 2 && cmd.getArguments()[1] != "show") {
            return false;
        }

        return true;
    }

    // !user <USER> [show <reportID>]
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let UID = await KConf.userToID(
            msg.guild,
            command.getArguments()[0],
            server);

        if (UID == undefined) {
            msg.channel.send(conf
                .getTranslationStr(msg, "command.user.not_found"));

            return;
        }

        let m_user = await client.users.fetch(UID)

        /*
        if (guild_user == undefined) {
            m_user = (await msg.guild.fetchBans())
                .find(user => user.user.id == UID);

            if (m_user == undefined) {
                msg.channel.send(conf
                    .getTranslationStr(msg, "command.user.not_found"));
                return;
            } else {
                m_user = await m_user.user.fetch();
            }
        } else {
            m_user = guild_user;
        }
        */

        let kuser = server.getUser(UID);

        if (kuser == undefined) {
            msg.channel.send(conf
                .getTranslationStr(msg, "command.user.not_found"));
            return;
        }

        let date =
            new Intl.DateTimeFormat('en', { year: 'numeric' })
                .format(m_user.createdAt)+"-"+

            new Intl.DateTimeFormat('en', { month: '2-digit' })
                .format(m_user.createdAt)+"-"+

            new Intl.DateTimeFormat('en', { day: '2-digit' })
                .format(m_user.createdAt)

        if (command.getArguments().length == 1) { // <user>
            let embed = new MessageEmbed()

            .setTitle(conf.getTranslationStr(msg, "command.user.user")+
                ": "+m_user.username)

            .setImage(m_user.avatarURL())
            .setColor('#add8e6')
            .addFields(
                {
                    name: conf.getTranslationStr(msg, "command.user.name"),
                    value: m_user.username+"#"+m_user.discriminator,
                    inline: true
                },
                {
                    name: "ID",
                    value: m_user.id,
                    inline: true
                },
                {
                    name: conf.getTranslationStr(msg, "command.user.creation_date"),
                    value: date,
                    inline: true
                },
                {
                    name: conf.getTranslationStr(msg, "command.user.message_count"),
                    value: kuser.getMessageCount(),
                    inline: true
                },
                {
                    name: conf.getTranslationStr(msg, "command.user.entries"),
                    value: kuser.getEntries().getEntries().length,
                    inline: true
                },
                {
                    name: "AvatarURL",
                    value: m_user.avatarURL() == null
                        ? conf.getTranslationStr(
                            msg,
                            "command.user.avatar_not_found")
                        : m_user.avatarURL()
                },
                {
                    name: "Banned?",
                    value: (await msg.guild.fetchBans())
                        .find(user => user.user.id == UID) != undefined
                            ? conf.getTranslationStr(msg, "general.yes")
                            : conf.getTranslationStr(msg, "general.no")
                }
            );

            msg.channel.send({ embed: embed });
        } else if (command.getArguments().length == 2) { // <user> show
            if (kuser.getEntries().getEntries().length == 0) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.user.no_entries"));

                return;
            }

            let message_content: string = "";

            for (let i = 0; i < kuser.getEntries().getEntries().length; i++) {
                let e = kuser.getEntries().getEntries()[i];
                message_content += "**[`"+e.getID()+"`]**\t"+e.getContent()+"\n";
            }

            msg.channel.send(message_content);
        } else if (command.getArguments().length == 3) { // <user> show <id>
            let e = kuser.getEntries().getEntry(command.getArguments()[2]);

            if (e == undefined) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.user.entry_not_found"));

                return;
            }

            let embed = new MessageEmbed()
                .setTitle(conf.getTranslationStr(msg, "command.user.user")+
                    ": "+m_user.username)
                .setColor('#f54242')
                .addFields(
                    {
                        name: "UID",
                        value: m_user.id,
                        inline: true
                    },
                    {
                        name: "EID",
                        value: e.getID(),
                        inline: true
                    },
                    {
                        name: conf.getTranslationStr(msg, "command.user.report.date"),
                        value: e.getDate().toUTCString(),
                        inline: false
                    },
                    {
                        name: conf.getTranslationStr(msg, "command.user.report.content"),
                        value: e.getContent().toString().length == 0 ?
                            "<empty>" : e.getContent().toString(),
                        inline: false
                    },
                    {
                        name: conf.getTranslationStr(msg, "command.user.report.author"),
                        value: e.getAuthorID()+" / "+server.getUser(e.getAuthorID()).username,
                        inline: false
                    },
                    {
                        name: conf.getTranslationStr(msg, "command.user.report.url"),
                        value: e.getMsgURL()
                    }
                );

            msg.channel.send(embed);
        }
    }
}