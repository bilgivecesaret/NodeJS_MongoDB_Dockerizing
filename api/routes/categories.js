const express = require('express');
const router = express.Router();        

const Categories = require('../db/models/Categories');
const Responce = require('../lib/Responce');
const CustomError = require('../lib/Error');
const Enums = require('../config/Enum');
const AuditLogs = require('../lib/AuditLogs');
const logger = require('../lib/logger/LoggerClass');
const auth = require('../lib/auth')();
const config = require('../config');
const i18n = new( require('../lib/i18n'))(config.DEFAULT_LANG);
const emitter = require('../lib/Emitter');


router.all('*',auth.authenticate(), (req, res, next) => {
  next();
});

/* GET users listing. */
router.get('/', auth.checkRoles('category_view'), async (req, res) => {
    try {
        let categories = await Categories.find();
        res.json(Responce.successResponce(categories));
    } catch (error) {
        let errorResponce = Responce.errorResponce(error);
        res.status(errorResponce.code).json(errorResponce);   
    }
});

/* POST create category */
router.post('/add', auth.checkRoles('category_add'), async (req, res) => {
    let body = req.body;
    try {
        if(!body.name) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["name"]));

        let newCategory = new Categories({
            name: body.name,
            is_active: true,
            created_by: req.user?.id
        });
        await newCategory.save();

        AuditLogs.info(req.user?.email, "Categories", "Add", newCategory);
        logger.info(req.user?.email, "Categories", "Add", newCategory);

        emitter.getEmitter('notifications').emit('message', {message: newCategory.name + " is added"});

        res.json(Responce.successResponce(newCategory));
    } catch (error) {
        logger.error(req.user?.email, "Categories", "Add", error);
        let errorResponce = Responce.errorResponce(error, req.user.language);
        res.status(errorResponce.code).json(errorResponce);   
    }
});


/* UPDATE category */
router.post('/update/', auth.checkRoles('category_update'), async (req, res) => {

    let body = req.body;

    try {

        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["_id"]));
   
        let updates = {};

        if(body.name) updates.name = body.name;
        if(typeof body.is_active === "boolean") updates.is_active = body.is_active;    

        await Categories.updateOne({_id: body._id}, updates);

        AuditLogs.info(req.user?.email, "Categories", "Update", {_id: body._id, ...updates});

        emitter.getEmitter('notifications').emit('message', {message: body.name + " is updated"});

        res.json(Responce.successResponce({success: true}));
    } catch (error) {
        let errorResponce = Responce.errorResponce(error, req.user.language);
        res.status(errorResponce.code).json(errorResponce);   
    }
});


/* DELETE category */
router.post('/delete/', auth.checkRoles('category_delete'), async (req, res) => {

    let body = req.body;

    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user.language), i18n.translate("COMMON.FILED_MUST_BE_FILLED", req.user.language, ["_id"]));
        await Categories.deleteOne({_id: body._id});

        AuditLogs.info(req.user?.email, "Categories", "Delete", {_id: body._id});

        emitter.getEmitter('notifications').emit('message', {message: "Category is deleted"});

        res.json(Responce.successResponce({success: true}));
    } catch (error) {
        let errorResponce = Responce.errorResponce(error, req.user.language);
        res.status(errorResponce.code).json(errorResponce);   
    }
});

module.exports = router;