import { KCommand } from "./commands/KCommand";
import { KCommandUser } from "./commands/KCommandUser";
import { KCommandReload } from "./commands/KCommandReload";
import { KCommandReloadServer } from "./commands/KCommandReloadServer";
import { KCommandPerm } from "./commands/KCommandPerm";
import { KCommandActivate } from "./commands/KCommandActivate";
import { KCommandDeactivate } from "./commands/KCommandDeactivate";
import { KCommandSave } from "./commands/KCommandSave";
import { KCommandAlias } from "./commands/KCommandAlias";
import { KCommandUnalias } from "./commands/KCommandUnalias";
import { KCommandReport } from "./commands/KCommandReport";
import { KCommandUnreport } from "./commands/KCommandUnreport";
import { KCommandRefresh } from "./commands/KCommandRefresh";
import { KCommandBan } from "./commands/KCommandBan";
import { KCommandUnban } from "./commands/KCommandUnban";
import { KCommandKick } from "./commands/KCommandKick";
import { KCommandSay } from "./commands/KCommandSay";
import { KCommandJoke } from "./commands/KCommandJoke";
import { KCommandPing } from "./commands/KCommandPing";
import { KCommandExit } from "./commands/KCommandExit";
import { KCommandDice } from "./commands/KCommandDice";
import { KCommandThanks } from "./commands/KCommandThanks";
import { KCommandHelp } from "./commands/KCommandHelp";
import { KCommandPatch } from "./commands/KCommandPatch";
import { KCommandConfig } from "./commands/KCommandConfig";
import { KCommandWelcome } from "./commands/KCommandWelcome";
import { KCommandSyntax } from "./commands/KCommandSyntax";
import { KCommandGetLog } from "./commands/KCommandGetLog";
import { KCommandAutorespond } from "./commands/KCommandAutorespond";
import { KCommandStat } from "./commands/KCommandStat";

export class KCommandManager {
    static commands: KCommand[] = [];

    public static async init() {
        this.commands = [];
        this.commands.push(new KCommandUser());
        this.commands.push(new KCommandReload());
        this.commands.push(new KCommandReloadServer());
        this.commands.push(new KCommandPerm());
        this.commands.push(new KCommandActivate());
        this.commands.push(new KCommandDeactivate());
        this.commands.push(new KCommandSave());
        this.commands.push(new KCommandAlias());
        this.commands.push(new KCommandUnalias());
        this.commands.push(new KCommandReport());
        this.commands.push(new KCommandUnreport());
        this.commands.push(new KCommandRefresh());
        this.commands.push(new KCommandBan());
        this.commands.push(new KCommandUnban());
        this.commands.push(new KCommandKick());
        this.commands.push(new KCommandSay());
        this.commands.push(new KCommandJoke());
        this.commands.push(new KCommandPing());
        this.commands.push(new KCommandExit());
        this.commands.push(new KCommandDice());
        this.commands.push(new KCommandThanks());
        this.commands.push(new KCommandHelp());
        this.commands.push(new KCommandPatch());
        this.commands.push(new KCommandConfig());
        this.commands.push(new KCommandWelcome());
        this.commands.push(new KCommandSyntax());
        this.commands.push(new KCommandGetLog());
        this.commands.push(new KCommandAutorespond());
        this.commands.push(new KCommandStat());
    }

    public static getCommand(name: string): KCommand {
        for (let i in this.commands) {
            if (this.commands[i].getName() == name) {
                return this.commands[i];
            }
        }

        return undefined;
    }
}