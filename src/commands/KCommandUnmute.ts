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

export class KCommandUnmute extends KCommand {
    constructor() {
        super()
        this.command_name = "unmute";

        this.permissions = [
            "command.unmute"
        ]
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        const MAX_MUTE_COUNT = 3;
        let user: GuildMember = msg.guild
            .members
            .cache
            .get(await KConf.userToID(
                msg.guild,
                command.getArguments()[0],
                server));

        let role_id = server.getMuteRoll();

        if (user.roles.cache.has(role_id)) {
            user.roles.remove(role_id);

            msg.channel.send(server.getTranslation("command.unmute.unmuted")
                    .replace("{1}", command.getArguments()[0]));

        } else {
            msg.channel.send(server.getTranslation("command.unmute.not_muted")
                    .replace("{1}", command.getArguments()[0]));
        }
    }
}