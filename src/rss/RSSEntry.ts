var crypto = require('crypto');
import { parse, HTMLElement } from 'node-html-parser';

export class RSSEntry {
    title: string;
    author_displayname: string;
    author_username: string;
    author_userid: string;
    date: string;
    url: string;
    cached_hash: string;
    new_page: boolean;
    subtext: string;

    public static createFromFeedItem(item: any): RSSEntry {
        let new_page_indicator = [ "newpage", "neueseite" ]
        let html = parse(item["content:encoded"][0]);
        let e: RSSEntry = new RSSEntry();

        if (item["wikidot:authorName"] != undefined) {
            e.author_displayname = item["wikidot:authorName"];
            e.author_username = item["wikidot:authorName"];
            e.author_userid = item["wikidot:authorUserId"];
        }

        let etitle = item.title[0].split('" - ')[0];
        e.title = "unknown"
        if (etitle != undefined)
            e.title = etitle;

        e.url = item.link[0].split("#")[0];
        e.date = item.pubDate[0];

        let esubtext = item.title[0].split('" - ')[1];
        e.subtext = "unknown";

        if (esubtext != undefined) {
            e.subtext = esubtext.toString();
            e.title = e.title.substr(1, e.title.length-1);
        }

        let indicator = (e.subtext as string)
            .toLocaleLowerCase()
            .trim()
            .split(" ")
            .join("");

        e.new_page = new_page_indicator.includes(indicator) && indicator.length > 1;

        if (e.author_displayname == undefined || e.author_displayname.length < 2) {
            for (let i = 0; i < html.childNodes.length; i++) {
                if ((html.childNodes[i] as any).rawAttrs == 'class="printuser"') {
                    e.author_displayname = html.childNodes[i].rawText.trim();
                    e.author_username = (html.childNodes[i].childNodes[0] as HTMLElement).attributes.href.split("/").slice(-1)[0];
                    e.author_userid = (html.childNodes[i].childNodes[0] as HTMLElement).attributes.onclick.split("(")[1].split(")")[0];
                }
            }
        }

        e.cached_hash = e.getHash();
        return e;
    }

    public getHash(): string {
        if (this.cached_hash == undefined ||
            this.cached_hash == null ||
            this.cached_hash.length == 0) {

            this.cached_hash = this.computeHash();
        }

        return this.cached_hash;
    }

    public computeHash(): string {
        // Hash-components: link
        return crypto.createHash('sha256')
            .update(this.url)
            .digest("hex")
            .toString()
            .substr(0, 64);
    }

    public getURL(): string { return this.url; }
    public getTitle(): string { return this.title; }
    public getDate(): string { return this.date; }
    public getWikidotUserDisplayname(): string { return this.author_displayname; }
    public getWikidotUserUsername(): string { return this.author_username; }
    public isNewPage(): boolean { return this.new_page; }
}