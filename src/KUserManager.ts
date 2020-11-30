import { existsSync } from "fs";
import { KConf } from "./KConfig";
import { KServer } from "./KServer";
import { KUser } from "./KUser";

let rimraf = require("rimraf");

export class KUserManager {
    users: KUser[];

    public constructor() {
        this.users = [];
    }

    public addUser(user: KUser) {
        this.users.push(user);
    }

    public getUsers() {
        return this.users;
    }

    public getUser(id: string): KUser {
        /*
        for (let i in this.users) {
            if (this.users[i].getID() == id) {
                return this.users[i];
            }
        }
        */

        return this.users.find(e => e.getID() == id);
    }

    public deleteUser(id: string, server: KServer): boolean {
        this.users = this.users.filter((u, index, arr) => {
            return u.getID() != id;
        });

        let cfg_path = server.root_path+"/users/"+id+".json";

        try {
            rimraf.sync(cfg_path);
            return true;

        } catch(exception) {
            console.log("[ CONFIG ] [ ERROR ] Could'nt delete user config: "+cfg_path);
            console.log(exception);
        }

        return false;
    }

    public static fromJSONObject(obj: any): KUserManager {
        let umgr: KUserManager = new KUserManager();

        for (let i in obj.users) {
            umgr.addUser(KUser.fromJSONObject(obj.users[i]));
        }

        return umgr;
    }

    public toJSONObject(): object {
        let us = [];

        for (let i in this.users) {
            us.push(this.users[i].toJSONObject());
        }

        return {
            users: us
        }
    }
}