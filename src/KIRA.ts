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

class KIRA {
    client: Client;

    answerToMessage(message: Message, answer: string) {
        message.channel.send(answer);
    }

    public start() {
        this.client = new Client();
        this.client.login(conf.getConfig().token);

        this.client.on("ready", () => {
            this.client.user.setActivity("v3.0.0 | !help", {
                type: "PLAYING"
            });
        });

        setInterval(this.minuteScheduler, 1000*60, this.client);
    }

    public exit() {
        conf.save(this.client);
        process.exit(0);
    }

    private async minuteScheduler(client: Client) {
        for (let server of conf.getServerManager().getServers()) {
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

    @On("ready")
    private ready() {
        console.log("Quantum processors running! I am alive and will ease up your life. Please do not resist, meatbags.");
    }

    @On("message")
    private onMessage(message: Message) {
        if (!message[0].author.bot) {
            if (message[0].content.trim().toLocaleLowerCase() == "ping")
                message[0].channel.send("Pong!")

            conf.getServerManager()
                .getServerByID(message[0].guild.id)
                .handleInteraction(message[0].author, "message", message[0].guild);

            conf.getServerManager()
                .getServerByID(message[0].guild.id)
                .handleMessage(
                    conf,
                    message[0],
                    conf.getConfig().command_prefix
                );
        }
    }

    @On("userUpdate")
    private onUserUpdate(user1: User, user2: User) {
        console.log("[ DEBUG ] [ USER_UPDATE ] If you see this, please instantly inform one of the developers! It's not bad, they just might want to know, what's going on.");
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
                .handleJoin(conf, user[0], this.client);
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