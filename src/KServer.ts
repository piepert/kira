import {
    Message,
    Client,
    GuildMember,
    Channel,
    MessageEmbed,
    User,
    Guild, TextChannel
} from "discord.js";

import { KChannelConfig } from "./KChannelConfig";
import { KUserManager } from "./KUserManager";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "fs";
import { KParsedCommand } from "./KParsedCommand";
import { KRoleManager } from "./KRoleManager";
import { KCommandUser } from "./commands/KCommandUser";
import { KConf } from "./KConfig";
import { KCommandManager } from "./KCommandManager";
import { KCommand } from "./commands/KCommand";
import { KUser } from "./KUser";
import { KRole } from "./KRole";
import { KChannelConfigManager } from "./KChannelConfigManager";
import { Rule } from "@typeit/discord";

export class KServer {
    id: string;
    language: string;
    name: string;
    cfg_path: string;
    root_path: string;
    log_channel: string;

    join_message: boolean;

    frequency_cache: Map<string, number>;
    aliases: Map<string, string>;
    translations: Map<string, string>;
    deactivated_commands: string[];

    channels: KChannelConfigManager;
    users: KUserManager;
    roles: KRoleManager;

    constructor(id: string,
        name: string,
        language: string) {

        this.id = id;
        this.language = language;
        this.name = name;
        this.cfg_path = "";
        this.root_path = "";
        this.channels = new KChannelConfigManager();

        this.users = new KUserManager();
        this.roles = new KRoleManager();

        this.deactivated_commands = [];
        this.aliases = new Map<string, string>();
        this.translations = new Map<string, string>();
        this.frequency_cache = new Map<string, number>();
        this.log_channel = null;
    }

    public toJSONObject(): object {
        return {
            id: this.id,
            name: this.name,
            language: this.language,
            deactivated_commands: this.deactivated_commands,
            aliases: Object.fromEntries(this.aliases),
            translations: this.translations,
            log_channel: this.log_channel
        }
    }

    public static load(content: string,
        path: string,
        conf: KConf,
        old_load: boolean = false): KServer {

        let obj = JSON.parse(content);
        let s: KServer = new KServer(obj.id, obj.name, obj.language);

        s.cfg_path = path;
        s.deactivated_commands = obj.deactivated_commands;
        s.frequency_cache = new Map<string, number>();
        s.log_channel = obj.log_channel;

        if (s.log_channel == undefined) {
            s.log_channel = null;
        }

        if (obj.translations == undefined) {
            s.translations = new Map<string, string>();
        } else {
            s.translations = new Map<string, string>();

            for (let e of Object.keys(obj.translations)) {
                s.translations.set(e, obj.translations[e]);
            }
        }

        if (old_load) {
            s.users = KUserManager.fromJSONObject(obj.users);
            s.roles = KRoleManager.fromJSONObject(obj.roles);
            s.channels = KChannelConfigManager.fromJSONObject(obj.channels,
                s,
                old_load);

            s.root_path = conf.path_servers_dir+s.id+"/";
        }

        if (obj.aliases != undefined) {
            for (let k of Object.keys(obj.aliases)) {
                s.aliases.set(k, obj.aliases[k]);
            }
        }

        if (s.deactivated_commands == undefined) {
            s.deactivated_commands = [];
        }

        if (old_load) {
            conf.saveServer(s, true);
        }

        return s;
    }

    public static loadFile(file: string, conf: KConf): KServer {
        return this.load(readFileSync(file).toString(), file, conf, true);
    }

    public static loadDirectory(server_path: string,
        server_id: string,
        conf: KConf,
        path_servers_dir): KServer {

        let channels_path = server_path+"channels/";
        let users_path = server_path+"users/";
        let roles_path = server_path+"roles/";
        let rss_caches_path = server_path+"rss_cache/";

        for (let path of [
                path_servers_dir,
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

        let sfile = server_path+server_id+".json";
        let server: KServer = this.load(readFileSync(sfile).toString(), sfile, conf);
        server.root_path = server_path;

        server.users = new KUserManager();
        server.channels = new KChannelConfigManager();
        server.roles = new KRoleManager();

        let role_files = readdirSync(roles_path);
        for (let i = 0; i < role_files.length; i++) {
            let file = roles_path+role_files[i];

            server.roles.addRole(KRole.fromJSONObject(
                    JSON.parse(readFileSync(file).toString()
                )));
        }

        let user_files = readdirSync(users_path);
        for (let i = 0; i < user_files.length; i++) {
            let file = users_path+user_files[i];

            server.users.addUser(KUser.fromJSONObject(
                    JSON.parse(readFileSync(file).toString()
                )));
        }

        let channel_files = readdirSync(channels_path);
        for (let i = 0; i < channel_files.length; i++) {
            let file = channels_path+channel_files[i];

            server.channels.addChannel(KChannelConfig.fromJSONObject(
                    JSON.parse(readFileSync(file).toString()
                ), server));
        }

        return server;
    }

    public getLogChannel(): string {
        return this.log_channel;
    }

    public setLogChannel(id: string) {
        this.log_channel = id;
    }

    public getAlias(alias: string): string {
        return this.aliases.get(alias);
    }

    public setAlias(alias: string, command: string) {
        this.aliases.set(alias, command);
    }

    public getAliasesForCommand(command: string): string[] {
        let c_aliases: string[] = [];

        for (let alias of this.aliases.keys()) {
            // console.log(alias, "=>", this.aliases.get(alias), "==", command);

            if (this.aliases.get(alias) == command) {
                c_aliases.push(alias);
            }
        }

        return c_aliases;
    }

    public removeAlias(alias: string): boolean {
        if (this.aliases.has(alias)) {
            this.aliases.delete(alias);
            return true;
        }

        return false;
    }

    public async removeAliasesForCommand(command:string) {
        for (let alias of this.aliases.keys()) {
            if (this.aliases.get(alias) == command) {
                this.aliases.delete(alias);
            }
        }
    }

    public isCommandDeactivated(name: string): boolean {
        return this.deactivated_commands.includes(name);
    }

    public deactivateCommand(name: string) {
        if (!this.isCommandDeactivated(name))
            this.deactivated_commands.push(name);
    }

    public activateCommand(name: string) {
        if (this.isCommandDeactivated(name)) {
            for(let i = 0; i < this.deactivated_commands.length; i++) {
                if (this.deactivated_commands[i] == name) {
                    this.deactivated_commands.splice(i, 1);
                }
            }
        }
    }

    public userHasPermission(id: string,
        perm: string,
        conf: KConf,
        guild: Guild): boolean {
        if (conf.userIsOperator(id)) {
            return true;
        }

        return this.getUser(id).canPermission(perm);
    }

    public userHasPermissionsOR(id: string,
        perms: string[],
        conf: KConf,
        guild: Guild): boolean {

        for (let i in perms) {
            if (this.userHasPermission(id, perms[i], conf, guild)) {
                return true;
            }
        }

        return perms.length == 0;
    }

    public roleHasPermission(id: string,
        perm: string,
        conf: KConf,
        guild: Guild): boolean {
        if (conf.userIsOperator(id)) {
            return true;
        }

        if (this.getRoleManager().getRole(id) == undefined)
            return false;

        return this.getRoleManager().getRole(id).canPermission(perm);
    }

    public roleHasPermissionsOR(id: string,
        perms: string[],
        conf: KConf,
        guild: Guild): boolean {

        for (let i in perms) {
            if (this.roleHasPermission(id, perms[i], conf, guild)) {
                return true;
            }
        }

        return perms.length == 0;
    }

    public reloadConfig(conf: KConf): KServer {
        let s = KServer.loadDirectory(this.getPath(),
            this.id,
            conf,
            conf.path_servers_dir);

        this.channels = s.channels;
        this.id = s.id;
        this.language = s.language;
        this.name = s.name;
        this.users = s.users;
        this.roles = s.roles;
        this.deactivated_commands = s.deactivated_commands;
        this.frequency_cache = new Map<string, number>();

        return s;
    }

    public getPath(): string {
        return this.root_path;
    }

    public getRoleManager() {
        return this.roles;
    }

    public getChannelConfigs(): KChannelConfigManager {
        return this.channels;
    }

    public getChannelConfigsByID(id: string): KChannelConfig[] {
        let occurences: KChannelConfig[] = [];

        for (let i in this.channels.getChannels()) {
            if (this.channels.getChannels()[i].getChannelID() == id)
                occurences.push(this.channels.getChannels()[i]);
        }

        if (occurences.length != 0) {
            return occurences;
        }

        return undefined;
    }

    public getUsers(): KUserManager {
        return this.users;
    }

    public addChannelConfig(cc: KChannelConfig) {
        this.channels.addChannel(cc);
    }

    public existsChannel(id: string): boolean {
        /* for (let i in this.channels) {
            if (this.channels[i].getID() == id)
                return true;
        } */

        return this.channels.channels.find(e =>
                e.getChannelID() == id
            ) != undefined;
    }

    public getFeedByID(id: string): KChannelConfig {
        return this.channels.channels.find(e =>
            e.getConfigurationID() == id
        );

        /*for (let i in this.channels) {
            if (this.channels[i].getID() == id)
            return this.channels[i];
        }

        return undefined;*/
    }

    public getChannelsByType(type: string): KChannelConfig[] {
        let occurences: KChannelConfig[] = [];

        for (let i in this.channels) {
            if (this.channels[i].getType() == type)
                occurences.push(this.channels[i]);
        }

        if (occurences.length != 0) {
            return occurences;
        }

        return undefined;
    }

    public getID(): string { return this.id; }
    public setID(id: string) { this.id = id; }

    public getLanguage(): string { return this.language; }
    public setLanguage(language: string) { this.language = language; }

    public static getServerIDFromMessage(message: Message): string {
        return message.guild.id;
    }

    public async refreshUsers(guild: Guild) {
        guild.members.fetch().then((users) => {
            for (let i of users) {
                if (this.getUser(i[1].id) == undefined) {
                    this.users.addUser(new KUser(i[1].id, i[1].user.username));
                } else if (this.getUser(i[1].id).getDisplayName() != i[1].user.username) {
                    console.log("[ USER_UPDATE : "+guild.name+" ] username was changed from "+
                        this.getUser(i[1].id).getDisplayName()+
                        " to "+
                        i[1].user.username);

                    this.users.getUser(i[1].id).username = i[1].user.username;
                }
            }
        }).catch((reason) => {
            console.log("[ ERROR : KServer|305 ]", reason);
        });

        guild.fetchBans().then((bans) => {
            for (let i of bans) {
                if (this.getUser(i[1].user.id) == undefined) {
                    this.users.addUser(new KUser(i[1].user.id, i[1].user.username));
                } else if (this.getUser(i[1].user.id).getDisplayName() != i[1].user.username) {
                    this.users.getUser(i[1].user.id).username = i[1].user.username;
                }
            }
        }).catch((reason) => {
            console.log("[ ERROR : KServer|317 ]", reason);
        });

        let users = guild.members.cache;
        for (let i of users) {
            if (this.getUser(i[1].id) == undefined) {
                this.users.addUser(new KUser(i[1].id, i[1].user.username));
            } else if (this.getUser(i[1].id).getDisplayName() != i[1].user.username) {
                console.log("[ USER_UPDATE : "+guild.name+" ] username was changed from "+
                    this.getUser(i[1].id).getDisplayName()+
                    " to "+
                    i[1].user.username);

                this.users.getUser(i[1].id).username = i[1].user.username;
            }
        }
    }

    public getUser(id: string): KUser {
        return this.users.getUser(id);
    }

    public roleCanPermission(id: string, perm: string): boolean {
        return this.roles.getRole(id).canPermission(perm);
    }

    public roleCanPermissionsOR(id: string, perms: string[]): boolean {
        return this.roles.getRole(id).canPermissionsOR(perms);
    }

    public enableRolePermission(id: string, perm: string) {
        if (this.roles.getRole(id) != undefined) {
            this.roles.getRole(id).enablePermission(perm);
        }
    }

    public disableRolePermission(id: string, perm: string) {
        if (this.roles.getRole(id) != undefined) {
            this.roles.getRole(id).enablePermission(perm);
        }
    }

    public async handleInteraction(user: User,
        action_type: string,
        guild: Guild) {

        if (this.getUser(user.id) == undefined) {
            console.log("[ USER : NEW_USER ] On server", this.id.toString()+", new user:", user.id);
            this.users.addUser(new KUser(user.id, user.username));
        } else {
            this.users.getUser(user.id).updateDisplayName(user.username);
        }

        if (guild.roles.cache.size != this.roles.roles.length) {
            for (let role of guild.roles.cache.keys()) {
                console.log("[ USER : NEW_ROLE ] On server ", this.id.toString()+", new role:", role);

                if (this.roles.getRole(role) == undefined) {
                    this.roles.addRole(new KRole(role));
                }
            }
        }

        if (action_type == "message") {
            this.users.getUser(user.id).incMessageCount();
        }
    }

    public async handleCommand(conf: KConf,
        msg: Message,
        pref: string,
        client: Client) {

        console.log("[ COMMAND : "+msg.guild.name+" ] [ #"+(msg.channel as TextChannel).name+" ] "+
            msg.author.username+
            ": "+
            msg.content);

        let command: KParsedCommand = KParsedCommand.parse(msg.content, pref);

        if (command.getName().length > 1000) {
            msg.channel.send(conf.getTranslationStr(msg, "command.too_long"));
            return;
        }

        if (this.getAlias(command.getName()) != undefined) {
            command.setName(this.getAlias(command.getName()));
        }

        let c: KCommand = KCommandManager.getCommand(command.getName());

        if (c == undefined) {
            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.not_found")
                    .replace("{1}", command.getName())
            );

            return;
        }

        if (this.isCommandDeactivated(c.getName())) {
            msg.channel.send(conf.getTranslationStr(
                msg,
                "general.deactivated"
            ));
            return;
        }

        let role_permission = false;
        for (let role of msg.member.roles.cache) {
            role_permission = this.roleHasPermissionsOR(role[0], c.permissions, conf, msg.guild);

            if (role_permission)
                break;
        }

        if ((!this.userHasPermissionsOR(msg.author.id,
                c.permissions,
                conf,
                msg.guild)                                                                          // if user doesn't have permission and command ...

                && !role_permission)

            || (c.permissions[0] == "OPERATOR"                                                      // ... is not for operators
                && !conf.userIsOperator(msg.author.id))) {

            msg.channel.send(conf.getTranslationStr(
                msg,
                "command.no_permission"
            ));
        } else if (!c.validateSyntax(command)) {
            msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.invalid_syntax")
                .replace("{1}", conf.getConfig().command_prefix)
                .replace("{2}", command.getName()));
        } else {
            if (c.getFrequencyMaximum() != undefined) {                                             // check if command is more used than specified in
                if (this.frequency_cache[c.getName()] >= c.getFrequencyMaximum()) {                 // ... a time
                    msg.channel.send(conf.getTranslationStr(msg, "command."+c.getName()+".frequency"));
                    return;

                } else if (this.frequency_cache[c.getName()] == undefined ||
                    this.frequency_cache[c.getName()] == 0) {
                    this.frequency_cache[c.getName()] = 0;

                    setTimeout((command) => {
                        this.frequency_cache[command] = 0;
                    }, c.getFrequencyMinutes()*60*1000, c.getName());
                }

                this.frequency_cache[c.getName()] =
                    this.frequency_cache[c.getName()] + 1;
            }

            let u = this.getUser(msg.author.id);                                                    // create temp user object
            u.operator = conf.userIsOperator(u.getID());

            for (let r of msg.member.roles.cache.keys()) {
                if (this.getRoleManager().getRole(r) == undefined) {
                    continue;
                }

                u.enabled_permissions = u.enabled_permissions
                    .concat(this.getRoleManager()
                        .getRole(r)
                        .getCanPermissions());                                                      // add enabled perms from roles
            }

            c.run(conf,                                                                             // KIRA config (for translations)
                msg,                                                                                // discord message
                this,                                                                               // server
                command,                                                                            // parsed command
                u,                                                                                  // user, which executed the command
                client);
        }
    }

    public async handleMessage(conf: KConf,
        msg: Message,
        command_prefix: string,
        client: Client) {

        if (msg.content.startsWith(command_prefix)) {
            this.handleCommand(conf, msg, command_prefix, client);
        } else {
            /*
            console.log("[ MESSAGE : "+msg.guild.name+" ] [ #"+(msg.channel as TextChannel).name+" ] "+
                msg.author.username+
                ": "+
                msg.content);
            */
        }
    }

    public async handleJoin(conf: KConf, user: GuildMember, client: Client) {
        console.log("[ USER_JOINED ]", user.id, "joined on", this.id);
        this.refreshUsers(user.guild);

        (async function(conf: KConf,
            user: GuildMember,
            server: KServer,
            client: Client) {                                                                       // search for all greeting-channels on server ...

            for (let kchannel of server                                                             // ... and send a welcome message
                .getChannelConfigs()
                .getChannelsByType("join")) {

                const c = client.channels.cache.get(kchannel.getChannelID())

                c.fetch().then(channel => {
                    (channel as TextChannel).send(conf
                        .getTranslationManager()                       // TODO: SEND IT CORRECTLY!
                        .getTranslation(server.getLanguage())
                        .getTranslation("message.std.joined"))
                });
            }
        })(conf, user, this, client);
    }

    public async handleLeave(conf: KConf, user: GuildMember) {
        console.log("[ USER_LEFT ]", user.id, "left from", this.id);
    }

    public getTranslation(key: string) {
        return this.translations.get(key);
    }

    public hasTranslation(key: string): boolean {
        return this.translations.has(key);
    }

    public setTranslation(key: string, value: string) {
        return this.translations.set(key, value);
    }

    public deleteTranslation(key: string): boolean {
        if (this.translations.has(key)) {
            this.translations.delete(key);
            return !this.translations.has(key);
        }

        return false;
    }
}