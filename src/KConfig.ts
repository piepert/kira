import {
    Message,
    Client,
    Guild,
    Collection,
    User
} from "discord.js";

import {
    readFileSync,
    readdir,
    stat,
    readdirSync,
    statSync,
    writeFile,
    writeFileSync
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

    path_config_file: string;
    path_translation_dir: string;
    path_servers_dir: string;

    public load(config_f: string,
        translation_dir: string,
        servers_dir: string) {                                                                      // load config files

        KCommandManager.init();                                                                     // init CommandManager to add Commands
        this.config = JSON.parse(readFileSync(config_f).toString());

        this.path_config_file = config_f;                                                           // save all paths
        this.path_servers_dir = servers_dir;
        this.path_translation_dir = translation_dir;

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

        files = readdirSync(servers_dir);                                                           // read all server configs in directory

        for (let index in files) {                                                                  // iterate through all files in directory
            let file_path = servers_dir+files[index];                                               // create file path
            let file_name = files[index];                                                           // create file name
            let stat = statSync(file_path);                                                         // get stat

            if (file_name.startsWith("_") || !file_name.endsWith(".json"))                          // if file name starts with _ or isn't a json ...
                continue;                                                                           // ... file, ignore it

            if (stat.isFile())                                                                      // if file is a file, then load server config
                this.servers
                    .addServer((KServer.loadFile(file_path)));
        }
    }

    public static async userToID(guild: Guild, user: string, server: KServer): Promise<string> {                     // make @mention to ID
        if (/^[0-9]{7,20}$/.test(user) || /^<@![0-9]{7,20}>$/.test(user)) {                         // if ID or @mention
            user = user.replace("<@!", "").replace(">", "");

        } else if (/(@|).+#[0-9]{4}/.test(user)) {                                                  // if Name#0000
            if (user.startsWith("@")) {
                user = user.replace("@", "").trim();
            } else if (user.startsWith("\@")) {
                user = user.replace("\@", "").trim();
            }

            let u1 = guild.members.cache
                .array()
                .find(u =>
                    u.user.username.trimStart()+"#"+u.user.discriminator == user)

            if (u1 != undefined) return u1.user.id;

            /*for (let u of guild.members.cache.values()) {                                           // iterate through all users
                if (u.user.username.trimStart()+"#"+u.user.discriminator == user) {
                    return u.id;
                }
            }*/

            let ret_u = (await guild.fetchBans()).find(u =>                                         // iterate through all banned
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
        } else {
            let possibilities: string[] = [];

            for (let u of guild.members.cache.values()) {                                           // iterate through all users
                if (u.user.username.trim().startsWith(user.trim())) {
                    possibilities.push(u.user.id);
                }
            }

            let ret_u = (await guild.fetchBans())/*.find(u =>                                         // iterate through all banned
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

        return user.trim();
    }

    public static compareUser(guild: Guild, user1: string, user2: string, server: KServer): boolean {                // user1 and user2 both can be either ID or <@!ID>
        return this.userToID(guild, user1, server) == this.userToID(guild, user2, server);
    }

    public save(bot: Client) {                                                                      // save all settings for servers
        if (this.servers == undefined || this.servers == null)                                      // when not inited, init servers
            this.servers = new KServerManager();

        let channels = bot.channels.cache.keys();                                                   // get all channels, the bot has read-permissions

        for (let index of channels) {                                                               // iterate through all channels
            let server = (bot.channels.cache.get(index) as any).guild;                              // get server
            let server_id = server.id;                                                              // get server id

            if (this.getServerManager().getServerByID(server_id) == null ||                         // if does not exist in the list, add it with ...
                this.getServerManager().getServerByID(server_id) == undefined) {                    // ... english as the standard language

                console.log("[ ADD : SERVER ]", server_id);
                this.servers.addServer(new KServer(server_id, server.name, "en"));
            }
        }

        let servers = [];                                                                           // create json object
        for (let index in this.servers.getServers()) {                                              // iterate through all servers
            writeFileSync(
                this.path_servers_dir+this.servers.getServers()[index].getID()+".json",             // create file path for server config
                JSON.stringify(this.servers.getServers()[index].toJSONObject(), null, 4)            // create content for server config
            );
        }
    }

    public saveServer(id: string) {
        if (this.servers.getServerByID(id) == undefined) {
            console.log("[ ERROR ] Couldn't save settings for server server:",
                id,
                ", this server is unknown to me.");
            return;
        }

        writeFileSync(
            this.path_servers_dir+this.servers.getServerByID(id).getID()+".json",             // create file path for server config
            JSON.stringify(this.servers.getServerByID(id).toJSONObject(), null, 4)            // create content for server config
        );
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

    public getConfig(): any {
        return this.config;
    }

    public getServerManager(): KServerManager {
        return this.servers;
    }

    public getTranslationManager(): KTranslationManager {
        return this.translations;
    }

    public getTranslationStr(message: Message, key: string): string {
        return this.translations.getTranslation(
            this.getServerManager()
                .getServerByID(
                    KServer.getServerIDFromMessage(message)
                ).getLanguage(),
        ).getTranslation(key);
    }
}