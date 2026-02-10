const passport = require('passport');
const {ExtractJwt, Strategy} = require('passport-jwt');

const config = require('../config');
const User = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const privs = require('../config/role_privileges');
const Response = require('./Responce');
const { HTTP_CODES } = require('../config/Enum');
const CustomError = require('../lib/Error');
const i18n = new( require('../lib/i18n'))(config.DEFAULT_LANG);

module.exports = function () {
    let strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async (payload, done) => {
        try {
            let user = await User.findOne({_id: payload.id});

            if (user) {
                let userRoles = await UserRoles.find({user_id: payload.id});

                let rolePrivileges = await RolePrivileges.find({role_id: {$in: userRoles.map(ur => ur.role_id)}});
                
                const allPrivileges = privs.priviliges.map(p => p.key);

                let privileges = rolePrivileges.map(rp => privs.priviliges.find(p => p.key == rp.permission)).filter(Boolean);

                const isSuperAdmin = privileges.length === allPrivileges.length;

                done(null, {
                    id: user._id,
                    roles: privileges,
                    is_super_admin: isSuperAdmin,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    language: user.language,
                    exp: parseInt(Date.now() / 1000) * config.JWT.EXPIRATION_TIME
                });

            } else {
                done(new CustomError(HTTP_CODES.NOT_FOUND, i18n.translate("COMMON.NOT_FOUND", this.language)), null);
            }
        } catch (err) {
            done(err, null);
        }
    });

    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate('jwt', {session: false});
        },
        checkRoles : (...expectedRoles) => {
            return (req, res, next) => {

                if (req.user.is_super_admin) {
                    return next();
                }

                let privileges = req.user.roles.map(r => r.key);

                let hasPermission = expectedRoles.some(r => privileges.includes(r));

                if (!hasPermission) {
                    let response = Response.errorResponce(new CustomError(HTTP_CODES.UNAUTHORIZED, "Unauthorized","Need permissions"));
                    return res.status(response.code).json(response);
                }

                return next();
            }
        }
    };
};