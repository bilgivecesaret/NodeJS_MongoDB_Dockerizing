const mongoose = require('mongoose');
const is = require('is_js');
const config = require('../../config');
const i18n = new( require('../../lib/i18n'))(config.DEFAULT_LANG);
const {PASS_LENGTH, HTTP_CODES} = require('../../config/Enum');
const CustomError = require('../../lib/Error');
const bcrypt = require('bcrypt-nodejs');

const schema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    first_name: String,
    last_name: String,
    phone_number: String,
    language: {type: String, default: config.DEFAULT_LANG}
},{
    versionKey: false,
    timestamps:{
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Users extends mongoose.Model {

    validatePassword(password){
        return bcrypt.compareSync(password, this.password);
    }

    static validateFieldsBeforeAuth(email, password, lang){ 
        if(typeof password !== "string" || password.length < PASS_LENGTH || is.not.email(email)){
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR", lang), i18n.translate("USER.AUTH_ERROR", lang));
        }
        return null;
    }
}

schema.loadClass(Users);
module.exports = mongoose.model("users", schema);