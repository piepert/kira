import {
    Message,
    MessageEmbed,
    GuildMember,
    User
} from "discord.js";

import { KCommand } from "./KCommand";
import { KConf } from "../KConfig";
import { KParsedCommand } from "../KParsedCommand";
import { KServer } from "../KServer";
import { KUser } from "../KUser";
import { BranchURLs } from "../crom/BranchURLs";
import { Crom } from "../crom/Crom";
import { URL } from "url";
import { Client } from "discord.js";

export class KCommandSearch extends KCommand {
    constructor() {
        super()
        this.command_name = "search";

        this.permissions = [
            "command.search"
        ]
    }

    public validateSyntax(cmd: KParsedCommand): boolean {
        return (cmd.getArguments().length > 0);
    }

    // !search [branch] <title>
    public async run(conf: KConf,
        msg: Message,
        server: KServer,
        command: KParsedCommand,
        sender: KUser,
        client: Client) {

        let args = command.getArguments();
        // let branch = BranchURLs.meta.includes(args[0]) ? args[0] : null;

        let branches = (new RegExp("("+BranchURLs.meta.join("|")+")"+"(,("+BranchURLs.meta.join("|")+"))*")).test(args[0])
            ? args[0].split(",")
            : null;

        let title = args.join(" ");

        if (branches != null) {
            args.shift();
            title = args.join(" ").trim();
        } else {
            branches = [ null ];
        }

        let embeds = []

        for (let branch of branches) {
            let users = await Crom.searchUser(title, branch);
            let pages = await Crom.searchPage(title, branch);

            let embed = new MessageEmbed()
                .setFooter(conf.getTranslationStr(msg, "crom.requested_by").replace("{1}", msg.member.displayName), msg.author.avatarURL())
                .setColor(KConf.genColor(branch == null ? "a" : branch.toString()))
                .setTitle(
                    (branch == null ? "" : branch.toUpperCase() + " - ") +
                    conf.getTranslationStr(msg, "crom.pages").replace("{1}", pages.length));

            if (pages.length > 0) {
                for (let article of pages) {
                    embed.addField((branch == null || branches != [ null ]
                            ? "("+BranchURLs.pages["http://"+(new URL(article.url)).hostname][0].toUpperCase() + ") "
                            : "")
                        + article.wikidotInfo.title +

                        (article.alternateTitles.length == 0
                            ? ""
                            : " - " + article.alternateTitles[0].title) +

                        " (" + (article.wikidotInfo.rating < 0
                            ? "-"
                            : "+")
                            + article.wikidotInfo.rating+")",

                        conf.getTranslationStr(msg, "crom.search_url_subtitle")
                            .replace("{1}", article.url))
                }

                if (embed.fields.length > 0) {
                    embeds.push(embed);
                    embed = new MessageEmbed(embed);
                }
            }

            if (users.length > 0) {
                embed.fields = [];
                embed.setTitle(
                    (branch == null ? "" : branch.toUpperCase() + " - ") +
                    conf.getTranslationStr(msg, "crom.users")
                        .replace("{1}", users.length))

                for (let user of users) {
                    if (user.name == "(user deleted)") {
                        continue;
                    }

                    embed.addField((branch == null || branches != [ null ]
                            ? "" // ("+BranchURLs.pages["http://"+(new URL(article.url)).hostname][0].toUpperCase() + ") "
                            : "")
                        + user.name,

                        conf.getTranslationStr(msg,
                                user.statistics.pageCount == 1
                                    ? "crom.page_created"
                                    : "crom.pages_created")
                            .replace("{1}", user.statistics.pageCount) +

                        (user.authorInfos.length == 0
                            ? ""
                            : ", "+conf.getTranslationStr(msg, "crom.author_page")
                                .replace("{1}", user.authorInfos[0].authorPage.url)))
                }

                if (embed.fields.length > 0) {
                    embeds.push(embed);
                }
            }
        }

        for (let embed of embeds) {
            msg.channel.send(embed)
        }
    }
}