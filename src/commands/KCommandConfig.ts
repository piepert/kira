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
import { config, send } from "process";
import { KServer } from "../KServer";
import { KRole } from "../KRole";
import { KUser } from "../KUser";
import { KCommandManager } from "../KCommandManager";
import { Client } from "@typeit/discord/Client";

export class KCommandAlias extends KCommand {
    constructor() {
        super()
        this.command_name = "alias";

        this.permissions = [
            "admin.config"
        ];
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return false;
    }

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        cmd: KParsedCommand,
        sender: KUser,
        client: Client) {
    }
}