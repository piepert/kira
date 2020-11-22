// @ts-expect-error
console.old_log = console.log;
const START_TIME = new Date();

console.log = function(... a) {
    const fs = require("fs");
    if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs");
    }

    let file_name = "KIRA_log_"+START_TIME.getDate()  +
        "." + (START_TIME.getMonth()+1) +
        "." + START_TIME.getFullYear() +
        "." + START_TIME.getHours() +
        "_" + START_TIME.getMinutes() +
        "_" + START_TIME.getSeconds() + ".log";

    fs.appendFileSync("logs/"+file_name, "[ "+(new Date()).toLocaleString()+" ] ");
    process.stdout.write("[ "+(new Date()).toLocaleString()+" ] ");

    // @ts-expect-error
    console.old_log(... a);

    a.forEach(print => {
        fs.appendFileSync("logs/"+file_name,
            (typeof print == "string" ? print.toString() :
            (typeof print == "object" ? JSON.stringify(print) : print))+" ");
    });

    fs.appendFileSync("logs/"+file_name, "\n");
}

console.error = console.log;
console.log("LOG FILE NAME: logs/KIRA_log_"+START_TIME.getDate()  +
    "." + (START_TIME.getMonth()+1) +
    "." + START_TIME.getFullYear() +
    "." + START_TIME.getHours() +
    "_" + START_TIME.getMinutes() +
    "_" + START_TIME.getSeconds() + ".log")

import { KConf } from "./KConfig";
import { RSSParser } from "./rss/RSSParser";
let conf = new KConf();
conf.load("config.json", "translations/", "servers/");

import {
    Client,
    On
} from "@typeit/discord";

import {
    Message,
    GuildMember, User
} from "discord.js";
import { existsSync, lstatSync, readFileSync } from "fs";
import { KPatcher } from "./KPatcher";

class KIRA {
    client: Client;
    version: string;

    answerToMessage(message: Message, answer: string) {
        message.channel.send(answer);
    }

    public async start() {
        this.client = new Client();
        this.client.login(conf.getConfig().token);

        this.version = JSON.parse(readFileSync("../package.json") as any).version;                  // KIRA is started tge from static/ directory, ...
                                                                                                    // ... so the package.json lies in ../package.json

        this.client.on("ready", () => {
            this.client.user.setActivity("v"+this.version+" | !help", {
                type: "PLAYING"
            });

            conf.client = this.client;
        });

        setInterval(this.minuteScheduler, 1000*60, this.client);
    }

    public exit() {
        conf.save(this.client);
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

    @On("ready")
    private ready() {
        console.log("Quantum processors running! I am alive and "+
            "will ease up your life. Please do not resist, meatbags.");
    }

    @On("message")
    private onMessage(message: Message) {
        if (!message[0].author.bot) {
            if (message[0].guild == null) {
                message[0].reply("Direct messages are deactivated.");
                return;
            }

            if (message[0].content.trim().toLocaleLowerCase().trim().startsWith("ping"))
                message[0].channel.send("Pong!")

            conf.getServerManager()
                .getServerByID(message[0].guild.id)
                .handleInteraction(message[0].author, "message", message[0].guild);

            conf.getServerManager()
                .getServerByID(message[0].guild.id)
                .handleMessage(
                    conf,
                    message[0],
                    conf.getConfig().command_prefix,
                    conf.client
                );
        }
    }

    @On("userUpdate")
    private onUserUpdate(user1: User, user2: User) {
        console.log("[ DEBUG ] [ USER_UPDATE ] If you see this, please instantly "+
            "inform one of the developers! It's not bad, "+
            "they just might want to know, what's going on.");

        console.log(user1);
        console.log(user2);
    }

    @On("guildMemberAdd")
    private onGuildMemberAdd(user: GuildMember) {
        if (!user[0].user.bot) {
            conf.getServerManager()
                .getServerByID(user[0].guild.id)
                .handleInteraction(user[0].user, "user_join", user[0].guild);

            conf.getServerManager()
                .getServerByID(user[0].guild.id)
                .handleJoin(conf, user[0], conf.client);
        }
    }

    @On("guildMemberRemove")
    private onGuildMemberRemove(user: GuildMember) {
        if (!user[0].user.bot) {
            conf.getServerManager()
                .getServerByID(user[0].guild.id)
                .handleInteraction(user[0].user, "user_leave", user[0].guild);

            conf.getServerManager()
                .getServerByID(user[0].guild.id)
                .handleLeave(conf, user[0]);
        }
    }
}

let kira = new KIRA;
kira.start();

process.on('SIGINT', function() {
    console.log("[ WARN ] Caught interrupt signal. Exiting and saving...");
    console.log("[ WARN ] Please do not terminate the program!");
    kira.exit();
});