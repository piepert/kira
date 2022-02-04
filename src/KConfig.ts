import {
    Message,
    Client,
    Guild,
    Collection,
    User, GuildChannel, TextChannel, MessageEmbed, ColorResolvable
} from "discord.js";

import {
    readFileSync,
    readdir,
    stat,
    readdirSync,
    statSync,
    writeFile,
    writeFileSync, existsSync, mkdir, mkdirSync
} from "fs";

import { KServer } from "./KServer";
import { KTranslation } from "./KTranslation";
import { KTranslationManager } from "./KTranslationManager";
import { KServerManager } from "./KServerManager";
import { KCommandManager } from "./KCommandManager";
import { getServers } from "dns";
import { kStringMaxLength } from "buffer";

export class KConf {
    translations: KTranslationManager;
    config: any;
    servers: KServerManager;
    client: Client;
    version: string;

    path_config_file: string;
    path_translation_dir: string;
    path_servers_dir: string;

    no_rss_server_warnings: string[];

    public load(config_f: string,
        translation_dir: string,
        servers_dir: string) {                                                                      // load config files

        KCommandManager.init();                                                                     // init CommandManager to add Commands
        this.config = JSON.parse(readFileSync(config_f).toString());

        this.path_config_file = config_f;                                                           // save all paths
        this.path_servers_dir = servers_dir;
        this.path_translation_dir = translation_dir;

        this.no_rss_server_warnings = [];

        this.servers = new KServerManager();
        this.translations = new KTranslationManager();

        if (!translation_dir.endsWith("/"))
            translation_dir += "/";

        let files = readdirSync(translation_dir);

        for (let index in files) {                                                                  // iterate through all files in directory
            let file_path = translation_dir+files[index];                                           // create file path
            let file_name = files[index];                                                           // create file name
            let stat = statSync(file_path);                                                         // get stat

            if (file_name.startsWith("_") || !file_name.endsWith(".json"))                          // if file name starts with _ or isn't a json file, ignore it
                continue;

            if (stat.isFile())                                                                      // if file is a file, then load translation config
                this.translations
                    .addTranslation(
                        KTranslation.load(file_name.replace(".json", ""),
                        readFileSync(file_path).toString())
                    );
        }

        if (!servers_dir.endsWith("/"))
            servers_dir += "/";

        let entries = readdirSync(servers_dir);                                                     // read all server configs in directory
        console.log("List for files/directories to load:")

        for (let i in entries) {
            if ((/[0-9]{4,25}/.test(entries[i])) ||
                (/[0-9]{4,25}\.json/.test(entries[i]))) {

                console.log("   ->", entries[i]);
            }
        }

        for (let index in entries) {                                                                // iterate through all entries in directory
            let dir_path = servers_dir+entries[index];                                              // create file path
            let entry_name = entries[index];                                                        // create file name
            let stat = statSync(dir_path);                                                          // get stat

            if (!(/[0-9]{4,25}/.test(entry_name)))                                                  // if entry name is not an id, skip
                continue;
            else if ((/[0-9]{4,25}\.json/.test(entry_name))) {
                if (!stat.isDirectory()) {
                    console.log("");
                    console.log("[ LOAD ] Load old JSON file: "+entry_name);
                    let server = KServer.loadFile(dir_path, this);

                    if (this.servers.getServerByID(server.getID()) == undefined) {
                        console.log("[ LOAD ] Added server to list.");
                        this.servers.addServer(server, this);
                    } else {
                        console.log("[ LOAD ] [ INFO ] Server was already loaded from directory. Ignoring old file "+dir_path+".");
                    }
                }
            }

            if (stat.isDirectory()) {                                                               // if entry is a directory, then load server config
                dir_path += "/";

                console.log("");
                console.log("[ LOAD ] Loading server "+entry_name+" from "+dir_path);

                let server = KServer.loadDirectory(dir_path,
                    entry_name,
                    this,
                    this.path_servers_dir);

                if (this.servers.getServerByID(server.getID()) != undefined) {
                    console.log("[ LOAD ] Server already exists. Replacing now.");
                    this.servers.replaceServer(server.getID(), server);

                } else {
                    console.log("[ LOAD ] Added server to list.");
                    this.servers.addServer(server, this);
                }
            }
        }
    }

    public static async userToID(guild: Guild, user: string, server: KServer): Promise<string> {    // make @mention to ID
        if (/^[0-9]{7,25}$/.test(user) || /^<@![0-9]{7,25}>$/.test(user)) {                         // if ID or @mention
            user = user.replace("<@!", "").replace(">", "");
            return user;

        } else if (/(@|).+#[0-9]{4}/.test(user)) {                                                  // if Name#0000
            if (user.startsWith("@")) {
                user = user.replace("@", "").trim();
            } else if (user.startsWith("\@")) {
                user = user.replace("\@", "").trim();
            }

            let u1 = guild.members
                .cache
                .find(u =>
                    u.user.username.trimStart()+"#"+u.user.discriminator == user)

            if (u1 != undefined) return u1.user.id;

            /*for (let u of guild.members.cache.values()) {                                           // iterate through all users
                if (u.user.username.trimStart()+"#"+u.user.discriminator == user) {
                    return u.id;
                }
            }*/

            let ret_u = (await guild.bans.fetch()).find(u =>                                         // iterate through all banned
                u.user.username.trimStart()+"#"+u.user.discriminator == user
            );

            if (ret_u != undefined)
                return ret_u.user.id;

            let ret_u2 = (await guild.members.fetch()).find(u =>                                    // iterate through all users
                u.user.username.trimStart()+"#"+u.user.discriminator == user
            );

            if (ret_u2 != undefined)
                return ret_u2.user.id;

            for (let index = 0; index < server.users.users.length; index++) {
                let u = server.users.users[index];

                if (u.getDisplayName() == user.split("#")[0]) {
                    return u.getID();
                }
            }

            return undefined;
        } else {
            let possibilities: string[] = [];

            for (let u of guild.members.cache.values()) {                                           // iterate through all users
                if (u.user.username.trim().startsWith(user.trim())) {
                    possibilities.push(u.user.id);
                }
            }

            let ret_u = (await guild.bans.fetch())/*.find(u =>                                         // iterate through all banned
                true // u.user.username.trim().startsWith(user.trim()) == true
            );*/

            if (ret_u != undefined) {
                for (let u of ret_u) {
                    if (u[1].user.username.trim().startsWith(user.trim())) {
                        possibilities.push(u[1].user.id);
                    }
                }
            }

            if (possibilities.length == 0) {
                for (let index = 0; index < server.users.users.length; index++) {
                    let u = server.users.users[index];

                    if (u.getDisplayName().trim().startsWith(user.trim())) {
                        possibilities.push(u.getID());
                    }
                }
            }

            if (possibilities.length == 1)
                return possibilities[0];
        }

        return undefined;
    }

    public static async roleToID(guild: Guild, role: string): Promise<string> {                     // make @mention to ID
        if (/^[0-9]{7,25}$/.test(role) || /^<@\&[0-9]{7,25}>$/.test(role)) {                         // if ID or @mention
            role = role.replace("<@&", "").replace(">", "");
            return role;
        }

        let possibilities: string[] = [];

        for (let r of guild.roles.cache.values()) {                                 // iterate through all users
            if (r.name.trim().startsWith(role.trim())) {
                possibilities.push(r.id);
            }
        }

        if (possibilities.length == 1)
            return possibilities[0];

        return undefined;
    }

    public static compareUser(guild: Guild,
        user1: string,
        user2: string,
        server: KServer): boolean {                                                                 // user1 and user2 both can be either ID or <@!ID>
        return this.userToID(guild, user1, server) == this.userToID(guild, user2, server);
    }

    public save(bot: Client, is_auto_save: boolean) {                                               // save all settings for servers
        if (this.servers == undefined || this.servers == null)                                      // when not inited, init servers
            this.servers = new KServerManager();

        console.log("[ CONFIG ] Saving settings...")
        let channels = bot.channels.cache.keys();                                                   // get all channels, the bot has read-permissions

        for (let index of channels) {                                                               // iterate through all channels
            if ((bot.channels.cache.get(index) as any).guild == undefined) {
                continue;                                                                           // ignore dm channels
            }

            let server = (bot.channels.cache.get(index) as any).guild;                              // get server
            let server_id = server.id;                                                              // get server id

            if (this.getServerManager().getServerByID(server_id) == null ||                         // if does not exist in the list, add it with ...
                this.getServerManager().getServerByID(server_id) == undefined) {                    // ... english as the standard language

                console.log("[ ADD : SERVER ]", server_id);
                this.servers.addServer(new KServer(server_id, server.name, "en", this), this);
            }
        }

        for (let index in this.servers.getServers()) {                                              // iterate through all servers
            console.log("");
            this.saveServer(this.servers.getServers()[index], is_auto_save)
        }
    }

    public saveServer(server: KServer, is_auto_save: boolean) {
        if (server == undefined) {
            console.log("[ ERROR ] Couldn't save settings for server server:",
                server.getID(),
                ", this server is unknown to me.");
            return;
        }

        console.log("[ SAVE ] Saving server "+server.getID()+"...");

        if (is_auto_save != true) {
            let embed = new MessageEmbed()
                    .setColor("#fc6f6f")
                    .setTitle(this.getTranslationForServer(
                        server.id,
                        "log.kira_saving.title")
                            .replace("{1}", (new Date().toLocaleString())))
                    .setDescription(this.getTranslationForServer(
                        server.id,
                        "log.kira_saving.body"));

            this.logMessageToServer(this.client,
                server.id,
                embed);
        }

        let server_path = this.path_servers_dir+server.getID()+"/";
        let rss_caches_path = this.path_servers_dir+server.getID()+"/rss_cache/";

        let channels_path = server_path+"channels/";
        let channels = server.getChannelConfigs().getChannels();

        let users_path = server_path+"users/";
        let users = server.getUsers().getUsers();

        let roles_path = server_path+"roles/";
        let roles = server.getRoleManager().getRoles();

        // server folder structure:
        //  static/servers/<server_id>/
        //      ... /<server_id>.json
        //      ... /channels/<channel_id>.json
        //      ... /users/<user_id>.json
        //      ... /roles/<role_id>.json

        for (let path of [
                this.path_servers_dir,
                server_path,
                channels_path,
                users_path,
                rss_caches_path,
                roles_path
            ]) {

            if (!existsSync(path) || !statSync(path).isDirectory()) {
                mkdirSync(path);
            }
        }

        writeFileSync(
            server_path+server.getID()+".json",                                                     // create file path for server config
            JSON.stringify(server.toJSONObject(), null, 4)                                          // create content for server config
        );

        for (let i = 0; i < users.length; i++) {                                                    // save each user to a different json file
            writeFileSync(
                users_path+users[i].getID()+".json",
                JSON.stringify(users[i].toJSONObject(), null, 4)
            );
        }

        for (let i = 0; i < roles.length; i++) {                                                    // save each user to a different json file
            writeFileSync(
                roles_path+roles[i].getID()+".json",
                JSON.stringify(roles[i].toJSONObject(), null, 4)
            );
        }

        for (let i = 0; i < channels.length; i++) {                                                 // save each channel to a different json file
            writeFileSync(
                channels_path+channels[i].getConfigurationID()+".json",
                JSON.stringify(channels[i].toJSONObject(server), null, 4)
            );
        }

        console.log("[ SAVE ] Finished saving "+server.getID()+".")
    }

    public async reload() {
        this.load(
            this.path_config_file,
            this.path_translation_dir,
            this.path_servers_dir
        );
    }

    public userIsOperator(id: string): boolean {
        return this.getConfig().operators.includes(id);

        /* for (let i in this.getConfig().operators) {
            if (this.getConfig().operators[i] == id) {
                return true;
            }
        }

        return false;*/
    }

    public async logMessageToServer(client: Client, id: string, content: any) {
        let server = this.servers.getServerByID(id);
        console.log("[ SERVER ] [ LOG ] Log for server "+id+":");
        console.log(content.title);

        if (server == undefined) {
            console.log("[ SERVER ] [ LOG ] Server not found, logging message not send.");
            return;
        }

        try {
            if (server.getLogChannel() == null ||
                client.channels.cache.get(server.getLogChannel()) == undefined) {

                console.log("[ SERVER ] [ LOG ] Channel not found, logging message not send.");
                return;
            }

            let channel = (await client.channels.cache.get(server.getLogChannel()));

            if ((channel as TextChannel).send == undefined) {
                console.log("[ SERVER ] [ LOG ] An error occured, logging message not send.");
                return;
            }

            (channel as TextChannel).send({ embeds: [content] } as any);

        } catch(exception) {
            console.log("[ SERVER ] [ LOG ] An error occured, logging message not send.", exception);
            return;
        }
    }

    public getConfig(): any {
        return this.config;
    }

    public getServerManager(): KServerManager {
        return this.servers;
    }

    public getTranslationManager(): KTranslationManager {
        return this.translations;
    }

    public getTranslationStr(message: Message, key: string): any {
        let server = this.getServerManager().getServerByID(
                KServer.getServerIDFromMessage(message));

        if (server.hasTranslation(key)) {
            return server.getTranslation(key);
        }

        return this.translations.getTranslation(
            server.getLanguage(),
        ).getTranslation(key);
    }

    public getTranslationForServer(id: string, key: string): string {
        let server = this.getServerManager().getServerByID(id);

        if (server === undefined) {
            console.log("Error! Server undefined! Can't get translation for", id);

            return this.translations.getTranslation(
                "en",
            ).getTranslation(key);
        }

        if (server.hasTranslation(key)) {
            return server.getTranslation(key);
        }

        return this.translations.getTranslation(
            server.getLanguage(),
        ).getTranslation(key);
    }

    public static textToChannel(name: string, guild: Guild): GuildChannel {
        let c_channel = undefined;
        c_channel = guild.channels.cache.get(name);

        if (c_channel == undefined) {
            c_channel = guild.channels.cache.find(channel =>                                        // check for channel by name
                channel.name === name);

            if (c_channel == undefined) {
                c_channel = guild.channels.cache.find(ch =>                                         // check for channel by id
                    ch.id.toString() == name.substr(2, name.length-3));
            }
        }

        return c_channel;
    }

    public static genColor(seed): ColorResolvable {
        let sn = [...seed].map(e => e.charCodeAt(0)).reduce((accumulator, currentValue) => accumulator * currentValue);
        /*
        let ncolor = Math.floor((Math.abs(Math.sin(sn) * 16777215)) % 16777215);
        let color = ncolor.toString(16);

        // pad any colors shorter than 6 characters with leading 0s
        while(color.length < 6) {
            color = '0' + color;
        }

        let new_color = (parseInt(color.substr(0, 2), 16) % 120 + 100).toString(16)
            + (parseInt(color.substr(2, 2), 16) % 120 + 100).toString(16)
            + (parseInt(color.substr(4, 2), 16) % 120 + 100).toString(16);
        */

        const colors = [
            'DEFAULT',
            'WHITE',
            'AQUA',
            'GREEN',
            'BLUE',
            'YELLOW',
            'PURPLE',
            'LUMINOUS_VIVID_PINK',
            'FUCHSIA',
            'GOLD',
            'ORANGE',
            'RED',
            'GREY',
            'DARKER_GREY',
            'NAVY',
            'DARK_AQUA',
            'DARK_GREEN',
            'DARK_BLUE',
            'DARK_PURPLE',
            'DARK_VIVID_PINK',
            'DARK_GOLD',
            'DARK_ORANGE',
            'DARK_RED',
            'DARK_GREY',
            'LIGHT_GREY',
            'DARK_NAVY',
            'BLURPLE',
            'GREYPLE',
            'DARK_BUT_NOT_BLACK',
            'NOT_QUITE_BLACK'
        ];

        return colors[Math.floor((Math.abs(Math.sin(sn) * colors.length)) % colors.length)] as ColorResolvable;
    }
}