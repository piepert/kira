import {
    Message,
    MessageEmbed,
    GuildMember,
    User,
    Client
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";

export class KCommandMute extends KCommand {
    constructor() {
        super()
        this.command_name = "mute";

        this.permissions = [
            "command.mute",
            "command.mute.now"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        const MAX_MUTE_COUNT: number = 3;
        let user: GuildMember = msg.guild
            .members
            .cache
            .get(await KConf.userToID(
                msg.guild,
                command.getArguments()[0],
                server));

        if (user.id == sender.id) {
            msg.channel.send("(•ิ_•ิ)?");
        }

        let role_id = server.getMuteRoll();

        console.log("Mute:", server.getMuteCount(user.id), "/", MAX_MUTE_COUNT);
        server.incMuteCount(user.id, sender.id);

        if (user.roles.cache.has(role_id)) {
            msg.channel.send(server.getTranslation("command.mute.already_muted")
                .replace("{1}", command.getArguments()[0]));
            return;
        }

        if (server.getMuteCount(user.id) >= MAX_MUTE_COUNT
            || (sender.canPermission("command.mute.now") && !sender.operator)) {

            user.roles.add(role_id);
            console.log("B", server.getMuteCount(user.id));
            server.resetMuteCount(user.id);
            console.log("B", server.getMuteCount(user.id));

            msg.channel.send(server.getTranslation("command.mute.muted")
                .replace("{1}", command.getArguments()[0]));

        } else {
            msg.channel.send(server.getTranslation("command.mute.left")
                .replace("{1}", MAX_MUTE_COUNT-server.getMuteCount(user.id)));
        }
    }
}