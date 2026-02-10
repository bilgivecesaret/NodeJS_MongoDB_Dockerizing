const i18n = require('../i18n');

class I18n{
    constructor(lang) {
        this.lang = lang;
    }

    translate(text, lang = this.lang, params = []) {
        let arr = text.split('.'); // COMMON.VALIDATION_ERROR -> [COMMON, VALIDATION_ERROR]
        
        let translation = i18n[lang][arr[0]];   // text["EN"]["COMMON"];
        for (let i = 1; i < arr.length; i++) {
            translation = translation[arr[i]];  //  i=1 -> translation["VALIDATION_ERROR"]
        }

        translation = translation + ""; // if translation is number, convert it to string

        for (let i = 0; i < params.length; i++) {
            translation = translation.replace("{}", params[i]);
        }

        return translation + ""; // if translation is number, convert it to string
    }
}

module.exports = I18n;