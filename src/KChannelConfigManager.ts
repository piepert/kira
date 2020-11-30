import { existsSync } from "fs";
import { KChannelConfig } from "./KChannelConfig";
import { KServer } from "./KServer";

let rimraf = require("rimraf");

export class KChannelConfigManager {
    channels: KChannelConfig[];

    public constructor() {
        this.channels = [];
    }

    public toJSONObject(server: KServer): object {
        let channel_array = [];

        this.channels.forEach(channel => {
            channel_array.push(channel.toJSONObject(server))
        });

        return channel_array;
    }

    public static fromJSONObject(obj: any,
        server: KServer,
        old_load: boolean = false): KChannelConfigManager {

        let manager: KChannelConfigManager = new KChannelConfigManager();

        obj.forEach(channel => {
            manager.addChannel(KChannelConfig.fromJSONObject(channel,
                server,
                old_load));
        });

        return manager;
    }

    public deleteConfig(id: string, server: KServer) {
        this.channels = this.channels.filter((c, index, arr) => {
            return c.getConfigurationID() != id;
        });

        let cfg_path = server.root_path+"/channels/"+id+".json";

        try {
            rimraf.sync(cfg_path);
            return true;

        } catch(exception) {
            console.log("[ CONFIG ] [ ERROR ] Could'nt delete feed config: "+cfg_path);
            console.log(exception);
        }

        return false;
    }

    public getChannels(): KChannelConfig[] {
        return this.channels;
    }

    public addChannel(channel: KChannelConfig) {
        this.channels.push(channel);
    }

    public getChannelsByType(type: string): KChannelConfig[] {
        let chs = [];

        for (let channel of this.channels) {
            if (channel.getType() == type) {
                chs.push(channel);
            }
        }

        return chs;
    }
}