import { Client } from "@typeit/discord/Client";
import { IncomingMessage } from "http";
import { KChannelConfig } from "../KChannelConfig";
import { KConf } from "../KConfig";
import { KServer } from "../KServer";
import { RSSEntry } from "./RSSEntry";

export class RSSParser {
    public static fireFeed(url: string,
        channel: KChannelConfig,
        client: Client,
        server: KServer,
        conf: KConf) {

        // new page indicators:                     neue Seite
        // page changes indicators:                 Quelltextänderung
        // page moved/url renamed incicators:       Seite verschieben

        const http = require('http');
        const fs = require('fs');

        let req = http.get(url, function(response: IncomingMessage) {
            let str = "";

            response.on("data", (data) => {
                str += data;
            });

            response.on("end", () => {
                var parseString = require('xml2js').parseString;
                parseString(str, function (err, result) {
                    let items = result.rss.channel[0].item;
                    let entries: RSSEntry[] = [];

                    for (let item of items) {
                        channel.doFire(client,
                            server,
                            conf,
                            RSSEntry.createFromFeedItem(item));
                    }
                });
            });
        });

        req.end();
    }
}