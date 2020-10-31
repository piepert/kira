import { Message } from "discord.js";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";

export abstract class KCommand {
    command_name: string;
    permissions: string[];

    frequency_max: number;
    frequency_minutes: number;

    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser) {}

    public validateSyntax(cmd: KParsedCommand): boolean { return true; }
    public getName(): string { return this.command_name; }
    public getPermissions(): string[] { return this.permissions; }
    public getFrequencyMinutes(): number { return this.frequency_minutes; }
    public getFrequencyMaximum(): number { return this.frequency_max; }
}