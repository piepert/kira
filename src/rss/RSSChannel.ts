export class RSSChannel {
    hashes: string[];

    public addHash(hash: string) {
        this.hashes.push(hash);
    }

    public existsHash(hash: string) {
        return this.hashes.includes(hash);
    }
}