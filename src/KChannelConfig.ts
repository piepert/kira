import { Client } from "@typeit/discord";
import { MessageEmbed, TextChannel } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { KConf } from "./KConfig";
import { KServer } from "./KServer";
import { RSSChannel } from "./rss/RSSChannel";
import { RSSEntry } from "./rss/RSSEntry";

var crypto = require("crypto");

export class KChannelConfig {
    channel_id: string;
    type: string;
    rss_channel: RSSChannel;
    feed_url: string;
    title: string;
    only_new_pages_allowed: boolean;
    color: string;

    constructor() {
        this.channel_id = "";
        this.type = "";
        this.rss_channel = new RSSChannel();
        this.feed_url = "";
        this.title = "RSS-Änderung";
        this.only_new_pages_allowed = false;
        this.color = undefined;
    }

    public loadHashes(file_name: string) {                                                          // load hashes of already fired messages from file
        if (!existsSync(file_name)) {
            this.rss_channel.hashes = [];
            return;
        }

        this.rss_channel.hashes = readFileSync(file_name)
            .toString()
            .trim()
            .split("\n");
    }

    public saveHashes(file_name: string) {                                                          // write hashes of already fired messages to file
        writeFileSync(file_name, this.rss_channel.hashes.join("\n"));
    }

    public toJSONObject(server: KServer): object {
        this.saveHashes("servers/rss_caches/"+server.getID()+"_"+crypto.createHash('sha256')
                .update(this.feed_url+this.type+this.channel_id)
                .digest("hex")
                .toString()
                .substr(0, 8)+".txt");

        return {
            channel_id: this.channel_id,
            type: this.type,
            feed_url: this.feed_url,
            title: this.title,
            only_new_pages_allowed: this.only_new_pages_allowed,
            color: this.color
        }
    }

    public static fromJSONObject(obj: any, server: KServer): KChannelConfig {
        let ret: KChannelConfig = new KChannelConfig();

        ret.channel_id = obj.channel_id;
        ret.type = obj.type;
        ret.rss_channel.hashes = obj.hashes;
        ret.feed_url = obj.feed_url;
        ret.title = obj.title;
        ret.only_new_pages_allowed = obj.only_new_pages_allowed;
        ret.color = obj.color;

        ret.loadHashes("servers/rss_caches/"+server.getID()+"_"+crypto.createHash('sha256')
                .update(ret.feed_url+ret.type+ret.channel_id)
                .digest("hex")
                .toString()
                .substr(0, 8)+".txt");

        return ret;
    }

    public getChannelID(): string { return this.channel_id; }
    public setChannelID(id: string) { this.channel_id = id; }

    public getType(): string { return this.type; }
    public setType(type: string) { this.type = type; }

    public getTitle(): string { return this.title; }
    public setTitle(title: string) { this.title = title; }

    public isNewArticle(entry: RSSEntry): boolean {
        return !this.rss_channel.existsHash(entry.getHash());                                       // if doesn't exist new, else old
    }

    public onlyNewPagesAllowed(): boolean {
        return this.only_new_pages_allowed;
    }

    public setOnlyNewPagesAllowed(only_new: boolean) {
        this.only_new_pages_allowed = only_new;
    }

    public doFire(client: Client,
        server: KServer,
        conf: KConf,                                                                                // takes entry, checks isNewArticle and if true,
        entry: RSSEntry) {                                                                          // send message to channel with new entry

        if (this.isNewArticle(entry)) {
            if (this.onlyNewPagesAllowed()) {
                if (!entry.isNewPage())
                    return;

                const channel = client.channels.cache.find(channel => channel.id == this.channel_id);
                if (channel == undefined) {
                    console.log("[ RSS : ERROR ] [ "+client.guilds.cache.get(server.getID()).name+" ] Channel not found for message: "+channel.id)
                    return;
                }

                let embed = new MessageEmbed()
                    .setTitle(this.getTitle())
                    .setDescription("["+entry.title+"]("+entry.url+")")
                    .setFooter(entry.author_displayname,
                        "http://www.wikidot.com/avatar.php?userid="+entry.author_userid);

                if (this.color == undefined) {
                    embed.setColor('#e6d9ad')
                } else {
                    embed.setColor(this.color)
                }

                if (embed.length == 0
                    || embed == undefined
                    || embed == null
                    || JSON.stringify(embed.toJSON()) == JSON.stringify({})) {

                    console.log("[ RSS : ERROR ] [ "+client.guilds.cache.get(server.getID()).name+" ] Message empty:", embed)
                    return;
                }

                (channel as any).send({embed: embed});
                this.rss_channel.addHash(entry.getHash());
            } else {
                const channel = client.channels.cache.find(channel => channel.id == this.channel_id);
                if (channel == undefined) {
                    console.log("[ RSS : ERROR ] [ "+client.guilds.cache.get(server.getID()).name+" ] Channel not found for message: "+channel.id)
                    return;
                }

                let embed = new MessageEmbed()
                    .setTitle(this.getTitle())
                    .setDescription("["+entry.title+"]("+entry.url+")"+
                        (entry.subtext != "unknown" && entry.subtext.trim() != "" ? "  –  "+entry.subtext : ""))

                    .setFooter(entry.author_displayname,
                        "http://www.wikidot.com/avatar.php?userid="+entry.author_userid);

                // console.log("[ RSS : FIRE_CHANNEL ] [ MESSAGE AS JSON ]: ", {embed: embed});

                if (this.color == undefined) {
                    embed.setColor('#e6d9ad')
                } else {
                    embed.setColor(this.color)
                }

                if (embed.length == 0
                    || embed == undefined
                    || embed == null
                    || JSON.stringify(embed.toJSON()) == JSON.stringify({})) {

                    console.log("[ RSS : ERROR ] [ "+client.guilds.cache.get(server.getID()).name+" ] Message empty:", embed)
                    return;
                }

                (channel as any).send({embed: embed});
                this.rss_channel.addHash(entry.getHash());
            }

            console.log("[ RSS : FIRE_CHANNEL ] In channel "+this.channel_id+" new entry with hash "+entry.getHash()+" from "+this.feed_url);
            console.log("                       -> user    : "+entry.author_displayname)
            console.log("                       -> date    : "+entry.date)
            console.log("                       -> title   : "+entry.title)
            console.log("                       -> subtext : "+entry.subtext)
            console.log("                       -> url     : "+entry.url)
        }
    }
}