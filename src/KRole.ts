function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;

    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }

    return out;
}

export class KRole {
    enabled_permissions: string[];
    disabled_permissions: string[];
    id: string;

    constructor(id: string) {
        this.id = id;

        this.enabled_permissions = [];
        this.disabled_permissions = [];
    }

    public getID() {
        return this.id;
    }

    public toJSONObject(): object {
        return {
            id: this.id,
            enabled_permissions: uniq_fast(this.enabled_permissions),
            disabled_permissions: uniq_fast(this.disabled_permissions)
        }
    }

    public static fromJSONObject(obj: any): KRole {
        let role: KRole = new KRole(obj.id);
        role.setDisabledPermissions(obj.disabled_permissions);
        role.setEnabledPermissions(obj.enabled_permissions);

        return role;
    }

    private cmp_permissions(perm1: string, perm2: string): boolean {
        perm1 = perm1.trim();
        perm2 = perm2.trim();

        if (perm1 == perm2) {
            return true;
        } else if (perm1.endsWith("*")) {
            // console.log("DEBUG PERMISSIONS: "+perm2+" (1) starts with "+perm1.substr(0, perm1.length-1));
            return perm2.startsWith(perm1.substr(0, perm1.length-1));
        } else if (perm2.endsWith("*")) {
            // console.log("DEBUG PERMISSIONS: "+perm1+" (2) starts with "+perm2.substr(0, perm2.length-1));
            return perm1.startsWith(perm2.substr(0, perm2.length-1));
        }

        return false;
    }

    public getEnabledPermissions(): string[] {
        return this.enabled_permissions;
    }

    public getDisabledPermissions(): string[] {
        return this.disabled_permissions;
    }

    public getCanPermissions(): string[] {
        let ret: string[] = [];

        for (let i in this.enabled_permissions) {
            if (!this.isPermissionDisabled(this.enabled_permissions[i])) {
                ret.push(this.enabled_permissions[i]);
            }
        }

        return ret;
    }

    public isPermissionEnabled(permission: string): boolean {
        for (let i in this.enabled_permissions) {
            if (this.cmp_permissions(this.enabled_permissions[i],
                permission)) {

                return true;
            }
        }

        return false;
    }

    public isPermissionDisabled(permission: string): boolean {
        for (let i in this.disabled_permissions) {
            if (this.cmp_permissions(this.disabled_permissions[i],
                permission)) {

                return true;
            }
        }

        return false;
    }

    public canPermission(perm: string): boolean {
        return this.isPermissionEnabled(perm) &&
            !this.isPermissionDisabled(perm);
    }

    public canPermissions(perms: string[]): boolean {
        for (let i in perms) {
            if (!this.canPermission(perms[i])) {
                return false;
            }
        }

        return perms.length == 0;
    }

    public canPermissionsOR(perms: string[]): boolean {                                             // check if user has permission in OR-way ...
        for (let i in perms) {                                                                      // ... (check if he has one out of an array)
            if (this.canPermission(perms[i])) {
                return true;
            }
        }

        return perms.length == 0;
    }

    public async removePermission(permission: string) {
        for (let i = 0; i < this.enabled_permissions.length; i++) {
            if (this.cmp_permissions(this.enabled_permissions[i], permission)) {
                this.enabled_permissions.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.disabled_permissions.length; i++) {
            if (this.cmp_permissions(this.disabled_permissions[i], permission)) {
                this.disabled_permissions.splice(i, 1);
                i--;
            }
        }
    }

    public disablePermission(permission: string) {
        if (!this.isPermissionDisabled(permission)) {
            this.disabled_permissions.push(permission);
            const index = this.disabled_permissions.indexOf(permission);

            if (index > -1) {
                this.enabled_permissions.splice(index, 1);
            }
        }
    }

    public enablePermission(permission: string) {
        if (!this.isPermissionEnabled(permission)) {
            this.enabled_permissions.push(permission);
            const index = this.disabled_permissions.indexOf(permission);

            if (index > -1) {
                this.disabled_permissions.splice(index, 1);
            }
        }
    }

    public setEnabledPermissions(perms: string[]) {
        this.enabled_permissions = perms;
    }

    public setDisabledPermissions(perms: string[]) {
        this.disabled_permissions = perms;
    }
}