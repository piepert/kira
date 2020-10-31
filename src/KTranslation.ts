export class KTranslation {
    lang_name: string;
    lang_code: string;
    strings: Map<string, string>;
    joke_file: string;

    constructor(lang_code: string,
        lang_name: string,
        strings: Map<string, string>,
        joke_file: string) {

        this.lang_code = lang_code;
        this.lang_name = lang_name;
        this.strings = strings;
        this.joke_file = joke_file;
    }

    public static load(lang_code, config: string): KTranslation {
        let obj = JSON.parse(config);
        return (new KTranslation(lang_code, obj.lang, obj.strings, obj.jokes))
    }

    public getLangCode(): string {
        return this.lang_code;
    }

    public getTranslation(key: string) {
        return this.strings[key];
    }
}