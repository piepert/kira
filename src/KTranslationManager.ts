import { readFileSync, existsSync } from "fs";
import { KTranslation } from "./KTranslation";

export class KTranslationManager {
    translations: KTranslation[];

    constructor() {
        this.translations = [];
    }

    public async reset() {
        this.translations = [];
    }

    public getTranslation(lang_code: string): KTranslation {
        for (let index in this.translations) {
            if (this.translations[index].getLangCode() == lang_code)
                return this.translations[index];
        }

        return undefined;
    }

    public getJokes(lang_code: string): string[] {
        for (let index in this.translations) {
            if (this.translations[index].getLangCode() == lang_code) {
                let file = this.translations[index].joke_file;
                let jokes = [];

                if (!existsSync(file))
                    return undefined;

                return readFileSync(file, { encoding: "utf-8" })
                    .split("\n~~\n");
            }
        }

        return undefined;
    }

    public async getRandomJoke(lang_code: string): Promise<string> {
        for (let index in this.translations) {
            if (this.translations[index].getLangCode() == lang_code) {
                let file = this.translations[index].joke_file;
                let jokes = [];

                if (!existsSync(file))
                    return undefined;

                jokes = readFileSync(file, { encoding: "utf-8" })
                    .split("\n~~\n");

                return jokes[Math.floor(Math.random() * jokes.length)]
            }
        }

        return undefined;
    }

    public addTranslation(t: KTranslation) {
        this.translations.push(t);
    }
}