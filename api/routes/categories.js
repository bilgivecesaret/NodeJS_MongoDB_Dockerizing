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
const Export = require('../lib/Export');
const multer = require('multer');
const Import = new(require('../lib/Import'))();


const upload = multer({storage: multer.memoryStorage()}).single('import_file');


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

/* EXPORT categories */
router.post('/export', auth.checkRoles('category_export'), async (req, res) => {
    try {
        let categories = await Categories.find();
        let exportData = new Export();
        let excelData = exportData.toExcel(
            ["KATEGORİ ADI", "AKTİF", "OLUŞTURAN KULLANICI", "OLUŞTURULMA TARİHİ", "GÜNCELLENME TARİHİ"],
            ["name", "is_active", "created_by", "created_at","updated_at"],
            categories
        );

        const fileName = `categories_${Date.now()}.xlsx`;

        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(excelData);

    } catch (error) {
        let errorResponce = Responce.errorResponce(error, req.user.language);
        res.status(errorResponce.code).json(errorResponce);   
    }
});

/* IMPORT categories */
router.post('/import', auth.checkRoles('category_add'), upload, async (req, res) => {
    try {

        let file = req.file;

         const rows = Import.fromExcel(file.buffer);

        for(let i = 1; i < rows.length; i++){ 
            let [name, is_active, created_by, createdAt, updatedAt] = rows[i];
           
            await Categories.create({
                name,
                is_active,
                created_by: created_by || req.user?.id,
                created_at: Import.parseExcelDate(createdAt),
                updated_at: Import.parseExcelDate(updatedAt)
            });
        }

        res.status(Enums.HTTP_CODES.CREATED).json(Responce.successResponce(req.body, Enums.HTTP_CODES.CREATED));

    } catch (error) {
        let errorResponce = Responce.errorResponce(error, req.user.language);
        res.status(errorResponce.code).json(errorResponce);   
    }
});



module.exports = router;