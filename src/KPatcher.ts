import { exec, spawn } from "child_process";
import { TextChannel } from "discord.js";
import { mkdirSync, rmdirSync, writeFileSync } from "fs";
import fs from "fs-extra";
import { IncomingMessage } from "http";
import { request } from "https";
import unzipper from "unzipper";
import { KConf } from "./KConfig";

var rimraf = require("rimraf");
var https = require('https');

export class KPatcher {
    public static async patch(channel: TextChannel, url: string, conf: KConf) {
        console.log("[ PATCH ] Installing patch from", url);
        conf.save(conf.client);

        // create backup of static directory; delete translations from the
        // backup to make sure, that the translation files are getting replaced
        this.createBackup()
        console.log("[ PATCH ] Start download of "+url);

        // downloading the patch file
        await channel.send("Downloading ZIP...");
        await this.downloadFile(url);
        console.log("[ PATCH ] Finished download of "+url+". Now unzipping.");

        if (!(await this.prepUnzipFile())) {
            console.log("[ PATCH ] Error at unzipping file. Aborting.")
            channel.send("An error accured during the unzipping of the file.");
            return;
        }

        await fs.createReadStream("patch.zip")
            .pipe(await unzipper
                .Extract({ path: "patch" })
                .on("close", async () => {
                    if (process.platform != "win32") {
                        // overwriting old files
                        await channel.send("Installing new files...");
                        console.log("[ PATCH ] Overwriting current files.")
                        await this.overwriteCurrentFiles();

                        // restoring old static folder
                        console.log("[ PATCH ] Restoring saved static directory.")
                        await this.restoreStaticBackup();

                        // restart KIRA application in background (or in new CMD Window on
                        // Windows)
                        await channel.send("Okay, patch was installed! Restarting after this message.");
                        this.restartApp();
                        await channel.send("Restart finished.");

                    } else {
                        await channel.send("Okay, patch was downloaded! Restarting KIRA and installing new patch after this message.");
                        this.restartApp();
                        // end with ERRORLEVEL 13 to say batch script that it can close the CMD window
                        process.exit(13);
                    }

                    process.exit(0);
                })
                .on("error", (error) => {
                    console.log("[ PATCH ] Unzipping error:", error);
                })
            );
    }

    // creates a backup of the static/ directory to static_backup/
    public static createBackup() {
        if (!fs.existsSync("../static_backup")) {
            fs.mkdirSync("../static_backup");
        }

        fs.copySync(".", "../static_backup");

        // delete old translations directory
        rimraf("../static_backup/translations/", err => {
            console.log("[ PATH ] RIMRAF ERROR:", err);
        })
    }

    // download zip file to static/patch.zip
    public static async downloadFile(url: string) {
        if (!fs.existsSync("patch.zip")) {
            writeFileSync("patch.zip", "");
        }

        await new Promise((resolve, reject) => {
            let file = fs.createWriteStream("patch.zip");

            if (url.startsWith("http://")) {
                https = require("http");
            }

            let stream = https.get(url, function(res: IncomingMessage) {
                res.on("error", (error: Error) => {
                    console.log("[ PATCH ] HTTP error: ", error);
                });

                res.on("data", (data) => {
                    file.write(data, () => {})
                })

                res.on("end", () => {
                    console.log(`The file is finished downloading.`);
                    file.close();
                    resolve(null);
                })
            })

            .on('error', (error) => {
                console.log("error:", error)
                reject(error);
            })
        })
        .catch(error => {
            console.log(`Something happened: ${error}`);
        });

        console.log("[ PATCH ] Downloaded the file.");
    }

    // unzip static/patch.zip to static/patch/
    public static async prepUnzipFile(): Promise<boolean> {
        if (!fs.existsSync("patch.zip")) {
            console.log("[ PATCH ] Error: Couldn't find patch.zip! Maybe there was an error at downloading the patch file.")
            return false;
        }

        if (!fs.existsSync("patch")) {
            mkdirSync("patch");
        }

        return true;
    }

    public static removePatchDirectory() {
        rmdirSync("patch");
    }

    // move files from static/patch/ to ../ (root directory of KIRA source)
    public static async overwriteCurrentFiles() {
        // await fs.copySync("patch/*", "..");

        const dir = fs.opendirSync('patch/')
        let dirent = null;

        console.log("[ PATCH ] Moving files:");

        while ((dirent = dir.readSync()) !== null) {
            let from_path = "patch/"+dirent.name;
            let to_path = "../"+dirent.name;

            console.log("[ PATCH ]     => "+from_path+" to "+to_path);

            if (fs.existsSync(to_path)) {
                if (!fs.lstatSync(to_path).isDirectory()) {
                    fs.unlinkSync(to_path)
                } else {
                    rimraf.sync(to_path);
                }
            }

            await fs.copySync(from_path, to_path);
        }

        dir.closeSync()
    }

    // move files from static/backup/ to static/
    public static async restoreStaticBackup() {
        await fs.copySync("../static_backup/.", ".");
    }

    public static restartApp() {
        const logfile = "patch_log.log";
        const out = fs.openSync(logfile, "a");
        const err = fs.openSync(logfile, "a");

        let command = process.argv;

        if (process.platform == "win32") {
            command = [
                "cmd",
                "/k",
                "start",
                "cmd",
                "/k",
                __dirname+"\\..\\run.bat",
                __dirname+"\\..",
                process.pid.toString()
            ];
        }

        const subprocess = spawn(
            command[0],
            command.slice(1),
            {
                detached: true,
                stdio: [
                    "ignore",
                    out,
                    err
                ]
            }
        );

        subprocess.on("error", (error) => {
            console.log("[ PATCH ] Error at restarting app:", error)
        });

        console.log("[ PATCH ] KIRA is being restarted in the background with PID "+
            subprocess.pid.toString()+".")

        subprocess.unref();
    }
}