import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    SnowflakeUtil
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KCommandManager } from "../KCommandManager";
import { KUser } from "../KUser";
import { Client } from "@typeit/discord/Client";
import { KServerQuote } from "../KServerQuote";

export class KCommandQuote extends KCommand {
    constructor() {
        super()
        this.command_name = "quote";

        this.permissions = [
            "command.quote.list",
            "command.quote.remove",
            "command.quote.get_one",
            "command.quote.add",
            "command.quote.show"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (/^(add( [0-9]+|)|remove [0-9a-f]+|list|show [0-9a-f]+|)$/g.test(cmd.getArguments().join(" ")));
    }

    /**
     * !quote add [message_id]      - add
     * !quote remove <hash_id>      - remove quote by hash
     * !quote list                  - list all quotes
     * !quote                       - get one quote
     * !quote show <hash_id>        - show the quote with hash_id
     */
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        const guild = (await client.guilds.fetch(server.getID()));

        if (command.getArguments().length == 0) {
            const quote = server.getQuotes()[Math.floor(Math.random() * server.getQuotes().length)];
            const user = (await guild.members.fetch(quote.getAuthorID())).user;

            msg.channel.send((new MessageEmbed())
                .setThumbnail(user.avatarURL())
                .addField(user.username+" — " +
                        (new Date(SnowflakeUtil.deconstruct(quote.getTimestamp()).timestamp))
                        .toLocaleString(),
                    quote.getMessageContent())
                .setFooter("#" + guild.channels.resolve(quote.getChannelID()).name +
                    ", ("+server.getShortestQuoteHash(quote.getHash())+")"))

        } else if (command.getArguments().length == 1) {
            if (command.getArguments()[0] == "add") {
                if (msg.reference == null) {
                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.add.missing_reference"))
                    return;
                } else {
                    let message = await msg.channel.messages.fetch(msg.reference.messageID);

                    if (message == undefined || message == null) {
                        message.channel.send(conf.getTranslationStr(msg, "command.quote.message_not_found"))
                        return;
                    }

                    let q = new KServerQuote(message.author.id,
                        message.content,
                        message.channel.id,
                        message.id)

                    if (server.getQuote(q.getHash()) == undefined) {
                        server.addQuote(q);

                        message.channel.send(conf.getTranslationStr(msg, "command.quote.added")
                            .replace("{1}", server.getShortestQuoteHash(q.getHash())))
                    } else {
                        message.channel.send(conf.getTranslationStr(msg, "command.quote.already_exists"))
                    }
                }

            } else if (command.getArguments()[0] == "list") {
                if (server.getQuotes().length == 0) {
                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.no_quotes"));
                    return;
                }

                let users = new Map<string, string[]>();

                for (let q of server.getQuotes()) {
                    if (users.get(q.getAuthorID()) == undefined) {
                        users.set(q.getAuthorID(), [ q.getHash() ])
                    } else {
                        users.set(q.getAuthorID(), users.get(q.getAuthorID()).concat([ q.getHash() ]))
                    }
                }

                for (let key of users.keys()) {
                    const user = (await guild.members.fetch(key)).user;
                    let embed = new MessageEmbed();

                    embed.setThumbnail(user.avatarURL());
                    embed.setTitle(user.username+", "+users.get(key).length +
                        " " +
                        conf.getTranslationStr(msg, "command.quote.quote" +
                            (users.get(key).length == 1 ? "s" : "")));

                    embed.setColor(KConf.genColor(key));

                    for (let hash of users.get(key)) {
                        embed.addField(server.getShortestQuoteHash(hash), server.getQuote(hash).getMessageContent());
                    }

                    msg.channel.send(embed);
                }
            }
        } else if (command.getArguments().length == 2) {
            if (command.getArguments()[0] == "add") {
                let message = await msg.channel.messages.fetch(command.getArguments()[1]);

                if (message == undefined || message == null) {
                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.message_not_found"))
                    return;
                }

                let q = new KServerQuote(message.author.id,
                    message.content,
                    message.channel.id,
                    message.id)

                if (server.getQuote(q.getHash()) == undefined) {
                    server.addQuote(q);

                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.added")
                        .replace("{1}", server.getShortestQuoteHash(q.getHash())))
                } else {
                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.already_exists"))
                }

            } else if (command.getArguments()[0] == "remove") {
                if (server.getQuote(command.getArguments()[1]) == undefined) {
                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.quote_not_found"))
                    return;
                }

                server.removeQuote(command.getArguments()[1]);
                msg.channel.send(conf.getTranslationStr(msg, "command.quote.quote_removed"))

            } else if (command.getArguments()[0] == "show") {
                if (server.getQuote(command.getArguments()[1]) == undefined) {
                    msg.channel.send(conf.getTranslationStr(msg, "command.quote.quote_not_found"))
                    return;
                }

                const quote = server.getQuote(command.getArguments()[1]);
                const user = (await guild.members.fetch(quote.getAuthorID())).user;

                msg.channel.send((new MessageEmbed())
                    .setThumbnail(user.avatarURL())
                    .addField(user.username+" — " +
                            (new Date(SnowflakeUtil.deconstruct(quote.getTimestamp()).timestamp))
                            .toLocaleString(),
                        quote.getMessageContent())
                    .setFooter("#"+guild.channels.resolve(quote.getChannelID()).name+", ("+server.getShortestQuoteHash(quote.getHash())+")"))
            }
        }
    }
}