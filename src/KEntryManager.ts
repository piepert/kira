import { KEntry } from "./KEntry";
var crypto = require('crypto');

export class KEntryManager {
    entries: KEntry[];

    constructor() {
        this.entries = [];
    }

    public toJSONObject(): object {
        let es: object[] = [];

        for (let e of this.entries) {
            es.push(e.toJSONObject());
        }

        return {
            entries: es
        }
    }

    public static fromJSONObject(obj: any): KEntryManager {
        let manager: KEntryManager = new KEntryManager();

        if (obj.entries == null) {
            return manager;
        }

        for (let i = 0; i < obj.entries.length; i++) {
            manager.addEntry(KEntry.fromJSONObject(obj.entries[i]));
        }

        return manager;
    }

    public static generateID(user_id: string, content: string, date: string) {
        var hash = crypto.createHash('sha256');
        var code = user_id+content+date;

        code = hash.update(code);
        code = hash.digest("hex").toString();

        return code.substr(0, 8);
    }

    public getEntries(): KEntry[] {
        return this.entries;
    }

    public async addEntry(entry: KEntry) {
        this.entries.push(entry)
    }

    public getEntry(id: string): KEntry {
        let es: KEntry[] = [];

        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].getID().startsWith(id)) {
                es.push(this.entries[i]);
            }
        }

        if (es.length != 1) {
            return undefined;
        } else {
            return es[0];
        }
    }

    public async removeEntry(id: string) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].getID() == id) {
                this.entries.splice(i, 1);
                i--;
            }
        }
    }
}