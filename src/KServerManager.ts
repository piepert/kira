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

    public addServer(t: KServer) {
        this.servers.push(t);
    }

    public getServers(): KServer[] {
        return this.servers;
    }
}