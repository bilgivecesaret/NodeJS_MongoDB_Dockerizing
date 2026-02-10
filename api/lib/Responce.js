const Enum = require('../config/Enum');
const CustomError = require('./Error');
const config = require('../config');
const i18n = new( require('./i18n'))(config.DEFAULT_LANG);

class Responce {
    constructor() {}

    static successResponce(data, code = 200) {
        return {
            code,
            data
        };
    }

    static errorResponce(error, lang) {
        console.error("Error Log:", error);
        if(error instanceof CustomError) {
            return {
                code: error.code,
                error :{
                    message: error.message,
                    description: error.description
                }
            };
        }else if(error.message && error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error :{
                    message: i18n.translate("COMMON.ALREADY_EXISTS", lang),
                    description: i18n.translate("COMMON.ALREADY_EXISTS", lang)
                }
            };
        }
        
        return {
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error :{
                message: i18n.translate("COMMON.UNKNOWN_ERROR", lang),
                description: error.message
            }
        };
    }
}

module.exports = Responce;