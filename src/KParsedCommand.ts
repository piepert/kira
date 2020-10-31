export class KParsedCommand {
    command: string;
    arguments: string[];

    constructor() {
        this.command = "";
        this.arguments = [];
    }

    public static parse(message_content: string, command_prefix: string): KParsedCommand {
        let command: KParsedCommand = new KParsedCommand();
        let tmp: string = "";
        message_content = message_content.trim();

        for (let i = 0; i < message_content.length; i++) {
            if (message_content[i] == "\"") {
                i++;

                while (i < message_content.length &&
                    message_content[i] != "\"") {

                    if (message_content[i] == "\\" &&
                        message_content[i+1] == "\"") {

                        tmp += message_content[i+1];
                        i++;
                    } else {
                        tmp += message_content[i];
                    }

                    i++;
                }
            } else if (message_content[i] == " ") {
                command.arguments.push(tmp);
                tmp = "";
            } else {
                tmp += message_content[i];
            }
        }

        command.arguments.push(tmp);

        if (command.arguments[0].startsWith(command_prefix))
            command.arguments[0] = command.arguments[0]
                .substr(command_prefix.length, command.arguments[0].length);

        command.command = command.arguments.shift();
        return command;
    }

    public getName(): string {
        return this.command;
    }

    public setName(name: string) {
        this.command = name;
    }

    public getArguments(): string[] {
        return this.arguments;
    }
}