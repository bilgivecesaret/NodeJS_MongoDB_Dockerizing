const Enum = require('../config/Enum');
const CustomError = require('./Error');

class Responce {
    constructor() {}

    static successResponce(data, code = 200) {
        return {
            code,
            data
        };
    }

    static errorResponce(error) {
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
                    message: "Already Exists",
                    description: "Already Exists"
                }
            };
        }
        
        return {
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error :{
                message: "Unknown Error",
                description: error.message
            }
        };
    }
}

module.exports = Responce;