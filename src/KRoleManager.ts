import { KRole } from "./KRole";

export class KRoleManager {
    roles: KRole[];

    public constructor() {
        this.roles = [];
    }

    public toJSONObject(): object {
        let us = [];

        for (let i in this.roles) {
            us.push(this.roles[i].toJSONObject());
        }

        return {
            users: us
        }
    }

    public getRoles(): KRole[] {
        return this.roles;
    }

    public static fromJSONObject(obj: any): KRoleManager {
        let umgr: KRoleManager = new KRoleManager();

        for (let i in obj.users) {
            umgr.addRole(KRole.fromJSONObject(obj.users[i]));
        }

        return umgr;
    }

    public getRole(id: string): KRole {
        for (let i in this.roles) {
            if (this.roles[i].getID() == id) {
                return this.roles[i];
            }
        }

        return undefined;
    }

    public addRole(role: KRole) {
        this.roles.push(role);
    }
}