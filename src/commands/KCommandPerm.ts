import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    Role
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { config } from "process";
import { KServer } from "../KServer";
import { KRole } from "../KRole";
import { KUser } from "../KUser";

export class KCommandPerm extends KCommand {
    constructor() {
        super()
        this.command_name = "perm";

        this.permissions = [
            "admin.perm.role.enable",
            "admin.perm.role.disable",
            "admin.perm.role.remove",
            "admin.perm.role.show",

            "admin.perm.user.enable",
            "admin.perm.user.disable",
            "admin.perm.user.remove",
            "admin.perm.user.show"
        ];
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        if (cmd.getArguments().length < 4 &&
            cmd.getArguments().length != 3) {                                                       // check for command syntax !user
            return false;
        }

        if (cmd.getArguments()[0] != "user"
            && cmd.getArguments()[0] != "role"
            && cmd.getArguments()[0] != "u"
            && cmd.getArguments()[0] != "r") {

            return false;
        }

        if (cmd.getArguments().length == 3
            && cmd.getArguments()[2] != "show") {

            return false;
        } else if (cmd.getArguments()[2] == "show"
            && cmd.getArguments().length != 3) {

            return false;
        }

        if (cmd.getArguments().length >= 4) {
            if (cmd.getArguments()[2] != "enable" &&
                cmd.getArguments()[2] != "disable" &&
                cmd.getArguments()[2] != "remove") {
                return false;
            }
        }

        return true;
    }

    // !perm user|role <USER|ROLE> enable|disable|show|remove <permission>
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser) {

        let use_id = command.getArguments()[1];
        let show: boolean = command.getArguments()[2] == "show";
        let enable: boolean = command.getArguments()[2] == "enable";
        let disable: boolean = command.getArguments()[2] == "disable";
        let remove: boolean = command.getArguments()[2] == "remove";
        let do_permissions: string[] = [];

        for (let i = 3; i < command.getArguments().length; i++) {
            do_permissions.push(command.getArguments()[i]);
        }

        if (command.getArguments()[0] == "role"
            || command.getArguments()[0] == "r") {

            let role: Role = await msg.guild.roles.cache.get(use_id);

            if (role == undefined) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.perm.role_not_found"
                ));
                return;
            }

            let krole: KRole = conf.getServerManager()
                .getServerByID(msg.guild.id)
                .getRoleManager()
                .getRole(role.id);

            if (krole == undefined) {
                msg.channel.send(conf.getTranslationStr(
                    msg,
                    "command.perm.role_not_found"
                ));

                return;
            }

            if (show) {
                if (!sender.canPermission("admin.perm.role.show")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));
                }

                let no_perms: string = conf.getTranslationStr(msg, "command.perm.no_registered_permissions");
                let enabled_permissions: string[] = [ no_perms ];
                let disabled_permissions: string[] = [ no_perms ];

                if (krole != undefined) {
                    enabled_permissions = krole.getEnabledPermissions();
                    disabled_permissions = krole.getDisabledPermissions();
                }

                if (enabled_permissions.length == 0) {
                    enabled_permissions = [ no_perms ];
                }

                if (disabled_permissions.length == 0) {
                    disabled_permissions = [ no_perms ];
                }

                msg.channel.send(new MessageEmbed()
                    .setTitle(conf.getTranslationStr(
                            msg,
                            "command.perm.show_role_permissions"
                        )+": "+role.name)

                    .setColor(role.hexColor)
                    .addFields(
                        {
                            name: conf.getTranslationStr(msg,
                                "command.perm.show_enabled"),
                            value: enabled_permissions
                        },
                        {
                            name: conf.getTranslationStr(msg,
                                "command.perm.show_disabled"),
                            value: disabled_permissions
                        }
                    )
                );
            } else if (enable) {
                if (!sender.canPermission("admin.perm.role.enable")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));
                }

                for (let i in do_permissions) {
                    server.getRoleManager()
                    .getRole(krole
                        .getID())
                        .enablePermission(do_permissions[i]);
                }

                msg.channel.send(conf
                        .getTranslationStr(msg, "command.perm.enabled")
                        .replace("{1}", do_permissions.join("`, `")));
            } else if (disable) {
                if (!sender.canPermission("admin.perm.role.disable")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));
                }

                for (let i in do_permissions) {
                    server.getRoleManager()
                    .getRole(krole
                        .getID())
                        .disablePermission(do_permissions[i]);
                }

                msg.channel.send(conf
                        .getTranslationStr(msg, "command.perm.disabled")
                        .replace("{1}", do_permissions.join("`, `")));
            } else if (remove) {
                if (!sender.canPermission("admin.perm.role.remove")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));

                    return;
                }

                for (let i in do_permissions) {
                    server.getRoleManager()
                    .getRole(krole
                        .getID())
                        .removePermission(do_permissions[i]);
                }

                msg.channel.send(conf
                        .getTranslationStr(msg, "command.perm.removed")
                        .replace("{1}", do_permissions.join("`, `")));
            }

        } else if (command.getArguments()[0] == "user"
            || command.getArguments()[0] == "u") {

            let UID = await KConf.userToID(msg.guild, use_id, server);

            if (UID == undefined) {
                msg.channel.send(conf
                    .getTranslationStr(msg, "command.user.not_found"));

                return;
            }

            let guild_user = await msg
                .guild
                .members
                .cache
                .get(UID);

            let m_user;

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
                m_user = guild_user.user;
            }

            let kuser: KUser = server.getUser(m_user.id);

            if (show) {
                if (!sender.canPermission("admin.perm.user.show")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));
                }

                let no_perms: string = conf.getTranslationStr(msg, "command.perm.no_registered_permissions");
                let enabled_permissions: string[] = [ no_perms ];
                let disabled_permissions: string[] = [ no_perms ];

                if (kuser != undefined) {
                    enabled_permissions = kuser.getEnabledPermissions();
                    disabled_permissions = kuser.getDisabledPermissions();
                }

                if (enabled_permissions.length == 0) {
                    enabled_permissions = [ no_perms ];
                }

                if (disabled_permissions.length == 0) {
                    disabled_permissions = [ no_perms ];
                }

                msg.channel.send(new MessageEmbed()
                    .setTitle(conf.getTranslationStr(
                            msg,
                            "command.perm.show_user_permissions"
                        )+": "+kuser.getDisplayName())

                    .addFields(
                        {
                            name: conf.getTranslationStr(msg,
                                "command.perm.show_enabled"),
                            value: enabled_permissions
                        },
                        {
                            name: conf.getTranslationStr(msg,
                                "command.perm.show_disabled"),
                            value: disabled_permissions
                        }
                    )
                );
            } else if (enable) {
                if (!sender.canPermission("admin.perm.user.enable")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));

                    return;
                }

                for (let i in do_permissions) {
                    server.getUser(m_user.id)
                        .enablePermission(do_permissions[i]);
                }

                msg.channel.send(conf
                        .getTranslationStr(msg, "command.perm.enabled")
                        .replace("{1}", do_permissions.join("`, `")));

            } else if (disable) {
                if (!sender.canPermission("admin.perm.user.disable")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));

                    return;
                }

                for (let i in do_permissions) {
                    server.getUser(m_user.id)
                        .disablePermission(do_permissions[i]);
                }

                msg.channel.send(conf
                        .getTranslationStr(msg, "command.perm.disabled")
                        .replace("{1}", do_permissions.join("`, `")));

            } else if (remove) {
                if (!sender.canPermission("admin.perm.user.remove")) {
                    msg.channel.send(conf.getTranslationStr(
                        msg,
                        "command.no_permission"
                    ));

                    return;
                }

                for (let i in do_permissions) {
                    server.getUser(m_user.id)
                        .removePermission(do_permissions[i]);
                }

                msg.channel.send(conf
                        .getTranslationStr(msg, "command.perm.removed")
                        .replace("{1}", do_permissions.join("`, `")));

            }
        }
    }
}