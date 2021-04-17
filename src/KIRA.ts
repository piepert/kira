// @ts-expect-error
console.old_log = console.log;

console.log = function(... a) {
    const fs = require("fs");
    if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs");
    }

    let d = new Date();
    let d_str = d.toLocaleString();
    let file_name = "KIRA_log_"+ ("0" + d.getDate().toString()).slice(-2) +
        "." + ("0" + (d.getMonth()+1).toString()).slice(-2) +
        "." + d.getFullYear() + ".log";

    fs.appendFileSync("logs/"+file_name, "[ "+d_str+" ] ");
    process.stdout.write("[ "+d_str+" ] ");

    // @ts-expect-error
    console.old_log(... a);

    a.forEach(print => {
        fs.appendFileSync("logs/"+file_name,
            (typeof print == "string" ? print.toString().replace(/\n/g, "\n[ "+d_str+" ] ") :
            (typeof print == "object" ? JSON.stringify(print) : print))+" ");
    });

    fs.appendFileSync("logs/"+file_name, "\n");
}

console.error = console.log;
console.log("\n===================================================");
console.log("[ INFO ] Kira started at", (new Date()).toLocaleString());

import { KConf } from "./KConfig";
import { RSSParser } from "./rss/RSSParser";
let conf = new KConf();
conf.load("config.json", "translations/", "servers/");

import {
    Client,
    Discord,
    On
} from "@typeit/discord";

import {
    Message,
    GuildMember, User, MessageEmbed, Intents, Guild, TextChannel
} from "discord.js";

import { existsSync, lstatSync, readFileSync } from "fs";
import { KPatcher } from "./KPatcher";
import { callbackify } from "util";
import { exit } from "process";
import { KServer } from "./KServer";
import { KCommandShip } from "./commands/KCommandShip";
import { KParsedCommand } from "./KParsedCommand";

class KIRA {
    client: Client;

    answerToMessage(message: Message, answer: string) {
        message.channel.send(answer);
    }

    public async start() {
        // this.client = new Client();
        this.client = new (require("discord.js")).Client(Intents.ALL);
        this.client.login(conf.getConfig().token);
        conf.client = this.client;
        conf.version = JSON.parse(readFileSync("../package.json") as any).version;                  // KIRA is started from static/ directory, ...
                                                                                                    // ... so the package.json lies in ../package.json

        Object(this.client).onMessage = this.onMessage;

        this.client.on("ready", this.ready);
        this.client.on("message", this.onMessage);
        this.client.on("guildMemberAdd", this.onGuildMemberAdd);
        this.client.on("guildMemberRemove", this.onGuildMemberRemove);
        this.client.on("guildMemberUpdate", this.onGuildMemberUpdate);
        this.client.on("guildBanAdd", this.onGuildBanAdd);
        this.client.on("guildBanRemove", this.onGuildBanRemove);
        this.client.on("guildCreate", this.onGuildCreate);

        setInterval(this.minuteScheduler, 1000*60, this.client);

        setInterval((bot) => {                                                                      // auto save every 60 minutes
            conf.save(bot, true);
        }, 1000*60*60, this.client)
    }

    public async exit() {
        await conf.save(this.client, false);
        process.exit(0);
    }

    public static fireRSSToServers(client: Client) {
        for (let server of conf.getServerManager().getServers()) {
            if (client.guilds.cache.get(server.getID()) == undefined) {

                if (!conf.no_rss_server_warnings.includes(server.getID())) {
                    console.log("[ RSS : WARN ] Server not found for message: "+
                        server.getID()+
                        ". Ignoring and not showing this message again until restart.");

                    conf.no_rss_server_warnings.push(server.getID());
                }

                continue;
            }

            for (let channel of server.getChannelConfigs().getChannels()) {
                if (channel.feed_url == "" || channel.feed_url == undefined) {
                    continue;
                }

                RSSParser.fireFeed(channel.feed_url,
                    channel,
                    client,
                    server,
                    conf);
            }
        }
    }

    private minuteScheduler(client: Client) {
        KIRA.fireRSSToServers(client);
    }

    private ready() {
        conf.client.user.setActivity("v"+conf.version+" | "+conf.getConfig().command_prefix+"help", {
            type: "PLAYING"
        });

        setInterval(() => {
            conf.client.user.setActivity("v"+conf.version+" | "+conf.getConfig().command_prefix+"help", {
                type: "PLAYING"
            });
        }, 12*1000*60*60);

        conf.client.guilds.cache.forEach(guild => {
            if (conf.servers.getServerByID(guild.id) === undefined) {
                conf.save(conf.client, false);
            }

            let embed = new MessageEmbed()
                    .setColor("#fc6f6f")
                    .setTitle(conf.getTranslationForServer(
                        guild.id,
                        "log.kira_started.title")
                            .replace("{1}", (new Date().toLocaleString())))
                    .setDescription(conf.getTranslationForServer(
                        guild.id,
                        "log.kira_started.body"));

            conf.logMessageToServer(conf.client,
                guild.id,
                embed);
        })

        console.log("Quantum processors running! I am alive and "+
            "will ease up your life. Please do not resist, meatbags.");
    }

    private onGuildCreate(guild: Guild) {
        console.log("[ INFO ] Joined server "+guild.id+"!");
        conf.save(conf.client, false);
    }

    private onMessage(message: Message) {
        if (!message.author.bot) {
            if (message.guild == null) {                                                            // operator command
                let guild: Guild = message.guild;

                if (!conf.userIsOperator(message.author.id)) {
                    message.reply("Direct messages are deactivated.");
                    return;
                }

                guild = conf.client.guilds.cache.get(message.content.split(" ")[0]);

                if (guild == null ||
                    guild == undefined ||
                    guild.toString().trim() == "") {

                    message.reply("Incorrect operator-message syntax.");
                    return;
                }

                for (let ch of guild.channels.cache.keys()) {
                    if (guild.channels.cache.get(ch).isText()) {
                        let old_message = Object.assign({}, message);
                        let channel = guild.channels.cache.get(ch) as TextChannel;

                        channel.messages.fetch({ limit: 1 }).then(messages => {
                            message = messages.first();
                            message.author = old_message.author;
                            message.content = old_message.content.split(" ").slice(1).join(" ");

                            this.onMessage(message);
                        })

                        return;
                    }
                }
            }

            if (message.content.trim()
                    .toLocaleLowerCase()
                    .replace(/[\!\?\.\,]/g, "") == "ping" &&
                !message.content
                    .trim()
                    .startsWith(conf.getConfig().command_prefix)) {

                message.channel.send("Pong!")
            }

            conf.getServerManager()
                .getServerByID(message.guild.id)
                .handleInteraction(message.author, "message", message.guild);

            conf.getServerManager()
                .getServerByID(message.guild.id)
                .handleMessage(
                    conf,
                    message,
                    conf.getConfig().command_prefix,
                    conf.client
                );
        }
    }

    private onGuildBanAdd(guild: Guild, user: User) {
        let embed = new MessageEmbed()
                .setColor("#fcc66f")
                .setTitle(conf.getTranslationForServer(
                    guild.id,
                    "log.user_banned.title")
                        .replace("{1}", (new Date().toLocaleString())))
                .setDescription(conf.getTranslationForServer(
                    guild.id,
                    "log.user_banned.body")
                        .replace("{1}", user.username+"#"+user.discriminator));

        conf.logMessageToServer(conf.client,
            guild.id,
            embed);
    }

    private onGuildBanRemove(guild: Guild, user: User) {
        let embed = new MessageEmbed()
                .setColor("#fcc66f")
                .setTitle(conf.getTranslationForServer(
                    guild.id,
                    "log.user_unbanned.title")
                        .replace("{1}", (new Date().toLocaleString())))
                .setDescription(conf.getTranslationForServer(
                    guild.id,
                    "log.user_unbanned.body")
                        .replace("{1}", user.username+"#"+user.discriminator));

        conf.logMessageToServer(conf.client,
            guild.id,
            embed);
    }

    private onGuildMemberUpdate(old_u: GuildMember, new_u: GuildMember) {
        if (old_u.displayName != new_u.displayName) {
            conf.logMessageToServer(conf.client, old_u.guild.id, new MessageEmbed()
                .setColor("#d6fc6f")
                .setTitle(conf.getTranslationForServer(
                        old_u.guild.id,
                        "log.user_changed.display_name"
                    )
                    .replace("{1}", new_u.user.username+"#"+new_u.user.discriminator)
                    .replace("{2}", (new Date().toLocaleString())))

                .addFields(
                    {
                        name: conf.getTranslationForServer(old_u.guild.id,
                            "log.user_changed.display_name.old"),
                        value: old_u.displayName,
                    },
                    {
                        name: conf.getTranslationForServer(old_u.guild.id,
                            "log.user_changed.display_name.new"),
                        value: new_u.displayName,
                    },
                    {
                        name: "ID",
                        value: "<@!"+new_u.id+">",
                    }
                )
            );
        }
    }

    private onGuildMemberAdd(user: GuildMember) {
        let embed = new MessageEmbed()
                .setColor("#d6fc6f")
                .setTitle(conf.getTranslationForServer(
                    user.guild.id,
                    "log.user_joined.title")
                        .replace("{1}", (new Date().toLocaleString())))
                .setDescription(conf.getTranslationForServer(
                    user.guild.id,
                    "log.user_joined.body")
                    .replace("{1}", user.user.username+"#"+user.user.discriminator)
                    .replace("{2}", user.id)
                    .replace("{3}", user.displayName));

        conf.logMessageToServer(conf.client,
            user.guild.id,
            embed);

        if (!user.user.bot) {
            conf.getServerManager()
                .getServerByID(user.guild.id)
                .handleInteraction(user.user, "user_join", user.guild);

            conf.getServerManager()
                .getServerByID(user.guild.id)
                .handleJoin(conf, user, conf.client);
        }
    }

    private onGuildMemberRemove(user: GuildMember) {
        let embed = new MessageEmbed()
                .setColor("#d6fc6f")
                .setTitle(conf.getTranslationForServer(
                    user.guild.id,
                    "log.user_left.title")
                        .replace("{1}", (new Date().toLocaleString())))
                .setDescription(conf.getTranslationForServer(
                    user.guild.id,
                    "log.user_left.body")
                    .replace("{1}", user.user.username+"#"+user.user.discriminator)
                    .replace("{2}", user.id)
                    .replace("{3}", user.displayName));

        conf.logMessageToServer(conf.client,
            user.guild.id,
            embed);

        if (!user.user.bot) {
            conf.getServerManager()
                .getServerByID(user.guild.id)
                .handleInteraction(user.user, "user_leave", user.guild);

            conf.getServerManager()
                .getServerByID(user.guild.id)
                .handleLeave(conf, user);
        }
    }
}

let kira = new KIRA;
kira.start();

process.on('SIGINT', async function() {
    console.log("\n[ WARN ] Caught interrupt signal. Exiting and saving...");
    console.log("[ WARN ] Please do not terminate the program!");

    await kira.exit();
});

process.on('unhandledRejection', (reason, p) => {
    console.error("Unhandled Rejection:", reason, p);
}).on('uncaughtException', err => {
    console.error("Uncaught Exception:", err);
});