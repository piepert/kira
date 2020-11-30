import { Client } from "@typeit/discord/Client";
import { IncomingMessage } from "http";
import { KChannelConfig } from "../KChannelConfig";
import { KConf } from "../KConfig";
import { KServer } from "../KServer";
import { RSSEntry } from "./RSSEntry";

const http = require('http');
const fs = require('fs');

export class RSSParser {
    public static fireFeed(url: string,
        channel: KChannelConfig,
        client: Client,
        server: KServer,
        conf: KConf) {

        // new page indicators:                     neue Seite
        // page changes indicators:                 Quelltextänderung
        // page moved/url renamed incicators:       Seite verschieben

        try {
            let req = http.get(url, function(response: IncomingMessage) {
                let str = "";

                response.on("data", (data) => {
                    str += data;
                });

                response.on("error", () => {
                    console.log("[ RSS ] (1) ERROR IN REED:", url);
                    return;
                });

                response.on("end", () => {
                    var parseString = require('xml2js').parseString;

                    if (str.includes("<head><title>502 Bad Gateway</title></head>")) {
                        console.log("[ RSS ] (2) ERROR IN REED:", url);
                        return;
                    }

                    parseString(str, function (err, result) {
                        if (err) {
                            console.log("[ RSS ] (3) ERROR IN FEED:", url)
                            console.log(err);

                            return;
                        }

                        try {
                            if (result == undefined) {
                                console.log("[ RSS ] (4) ERROR IN FEED:", url)
                                console.log("[ RSS ] TEXT: \n", str)
                                console.log("[ RSS ] RESULT: ", result);

                                return;
                            }

                            if (result.rss == undefined) {
                                console.log("[ RSS ] (5) ERROR IN FEED:", url)
                                console.log("[ RSS ] TEXT: \n", str)
                                console.log("[ RSS ] RESULT: ", result);

                                return;
                            }

                            let items = result.rss.channel[0].item;
                            let entries: RSSEntry[] = [];

                            for (let item of items) {
                                channel.doFire(client,
                                    server,
                                    conf,
                                    RSSEntry.createFromFeedItem(item));
                            }

                        } catch(error) {
                            console.log("[ RSS ] (6) CATCHED ERROR OF RSS FEED: ");
                            console.log("[ RSS ] FEED:", url);
                            console.log("[ RSS ] TEXT:", str);
                            console.log("[ RSS ] RESULT:", result);
                            console.log(error);
                        }
                    });
                });
            });

            req.on('error', error => {
                console.log("[ RSS ] (6) Error at URL:", url);
                console.error(error)
            })

            req.end();
        } catch(exception) {
            console.log("[ RSS ] (7) Error at URL:", url)
            console.log(exception);
        }
    }
}