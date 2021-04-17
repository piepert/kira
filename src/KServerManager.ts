import { KConf } from "./KConfig";
import { KServer } from "./KServer";

export class KServerManager {
    servers: KServer[];

    constructor() {
        this.servers = [];
    }

    public async reset() {
        this.servers = [];
    }

    public getServerByID(id: string): KServer {
        return this.servers.find(e =>
            e.getID() == id
        );
    }

    public replaceServer(id: string, server: KServer) {
        for (let i in this.servers) {
            if (server.getID() == this.servers[i].getID()) {
                this.servers[i] = server;
            }
        }
    }

    public addServer(t: KServer, conf: KConf) {
        if (t.config == undefined) {
            t.setConf(conf);
        }

        this.servers.push(t);
    }

    public getServers(): KServer[] {
        return this.servers;
    }
}