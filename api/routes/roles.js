const express = require('express');
const router = express.Router();        

const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Responce = require('../lib/Responce');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const role_privileges = require('../config/role_privileges');
const auth = require('../lib/auth')();
const config = require('../config');
const i18n = new( require('../lib/i18n'))(config.DEFAULT_LANG);

router.all('*', auth.authenticate(), (req, res, next) => {
  next();
});

router.get('/', auth.checkRoles('role_view'), async (req, res) => {
  try {
    let roles = await Roles.find({});
    res.json(Responce.successResponce(roles));
  } catch (error) {
    let errorResponce = Responce.errorResponce(error, req.user.language);
    res.status(errorResponce.code).json(errorResponce);
  }
});

router.post('/add', auth.checkRoles('role_add'), async (req, res) => {
  let body = req.body;
   try {
    if (!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["role_name"]));
    if(!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["permissions", "Array"]));
    }

    let role = new Roles({
      role_name: body.role_name,
      is_active: true,
      created_by: req.user?.id
    });

    await role.save();

    for (let i=0; i<body.permissions.length; i++) {
      let priv = new RolePrivileges({
        role_id: role._id,
        permission: body.permissions[i],
        created_by: req.user?.id
      });

      await priv.save();
    }

    res.json(Responce.successResponce({success: true}));
  } catch (error) {
    let errorResponce = Responce.errorResponce(error, req.user.language);
    res.status(errorResponce.code).json(errorResponce);
  }
});

router.post('/update', auth.checkRoles('role_update'), async (req, res) => {
  let body = req.body;
   try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["_id"]));

    let update = {};

    if (body.role_name) update.role_name = body.role_name;
    if (typeof body.is_active === "boolean") update.is_active = body.is_active;

    if(body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0) {

      let permissions = await RolePrivileges.find({ role_id: body._id });
      let removedPermissions = permissions.filter(p => !body.permissions.includes(p.permission));
      let newPermissions = body.permissions.filter(p => !permissions.map(per => per.permission).includes(p));

      if(removedPermissions.length > 0) {
        let removedIds = removedPermissions.map(p => p._id);
        await RolePrivileges.deleteMany({ _id: { $in: removedIds } });
      }

      if(newPermissions.length > 0) {
        for (let i=0; i<newPermissions.length; i++) {
          let priv = new RolePrivileges({
            role_id: body._id,
            permission: newPermissions[i],
            created_by: req.user?.id
          });
          await priv.save();
        }
      }
    }

    await Roles.updateOne({ _id: body._id }, update);

    res.json(Responce.successResponce({success: true}));

  } catch (error) {
    let errorResponce = Responce.errorResponce(error, req.user.language);
    res.status(errorResponce.code).json(errorResponce);
  }
});

router.post('/delete', auth.checkRoles('role_delete'), async (req, res) => {
  let body = req.body;
   try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["_id"]));

    await Roles.remove({ _id: body._id });
    res.json(Responce.successResponce({success: true}));
    
  } catch (error) {
    let errorResponce = Responce.errorResponce(error, req.user.language);
    res.status(errorResponce.code).json(errorResponce);
  }
});

router.get('/role_privileges', async (req, res) => {
  res.json(role_privileges);
});

module.exports = router;