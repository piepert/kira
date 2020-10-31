import { KUser } from "./KUser";

export class KEntry {
    id: string;
    date: Date;
    content: string;
    author_id: string;
    msg_url: string;

    constructor() {
        this.id = "";
        this.content = "";
        this.date = new Date();
        this.author_id = "";
        this.msg_url = "";
    }

    public toJSONObject(): object {
        return {
            id: this.id,
            date_str: this.date.toUTCString(),
            content: this.content,
            author_id: this.author_id,
            msg_url: this.msg_url
        }
    }

    public static fromJSONObject(obj: any): KEntry {
        let entry: KEntry = new KEntry();

        entry.setID(obj.id);
        entry.setDate(new Date(obj.date_str));
        entry.setContent(obj.content);
        entry.setMsgURL(obj.msg_url);
        entry.setAuthorID(obj.author_id);

        return entry;
    }

    public getID(): string { return this.id; }
    public setID(id: string) { this.id = id; }

    public getMsgURL(): string { return this.msg_url; }
    public setMsgURL(url: string) { this.msg_url = url; }

    public getContent(): string { return this.content; }
    public setContent(content: string) { this.content = content; }

    public getAuthorID(): string { return this.author_id; }
    public setAuthorID(author_id: string) { this.author_id = author_id; }

    public getDate(): Date { return this.date; }
    public setDate(date: Date) { this.date = date; }
}