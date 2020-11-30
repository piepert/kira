export class RSSChannel {
    hashes: string[];

    public constructor() {
        this.hashes = [];
    }

    public addHash(hash: string) {
        this.hashes.push(hash);
    }

    public existsHash(hash: string) {
        return this.hashes.includes(hash);
    }
}