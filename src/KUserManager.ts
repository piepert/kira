import { KUser } from "./KUser";

export class KUserManager {
    users: KUser[];

    public constructor() {
        this.users = [];
    }

    public addUser(user: KUser) {
        this.users.push(user);
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