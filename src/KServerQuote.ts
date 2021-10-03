var crypto = require('crypto');

export class KServerQuote {
    private authorID: string;
    private message_content: string;
    private hash: string;

    private channelID: string;
    private timestamp: string;

    public getAuthorID(): string { return this.authorID; }
    public getMessageContent(): string { return this.message_content; }
    public getChannelID(): string { return this.channelID; }
    public getTimestamp(): string { return this.timestamp; }
    public getHash(): string { return this.hash; }

    public constructor(authorID: string,
        message_content: string,
        channelID: string,
        timestamp: string) {

        this.authorID = authorID;
        this.message_content = message_content;
        this.channelID = channelID;
        this.timestamp = timestamp;
        this.hash = this.computeHash();
    }

    public computeHash(): string {
        return crypto.createHash('sha256')
            .update(this.authorID+this.message_content+this.timestamp)
            .digest("hex")
            .toString()
            .substr(0, 64);
    }

    public toJSONObject() {
        return {
            authorID: this.authorID,
            message_content: this.message_content,
            channelID: this.channelID,
            timestamp: this.timestamp
        }
    }

    public static fromJSONObject(obj: any): KServerQuote {
        let quote: KServerQuote = new KServerQuote(obj.authorID,
            obj.message_content,
            obj.channelID,
            obj.timestamp);

        return quote;
    }
}