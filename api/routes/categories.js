const express = require('express');
const router = express.Router();        

const Categories = require('../db/models/Categories');
const Responce = require('../lib/Responce');
const CustomError = require('../lib/Error');
const Enums = require('../config/Enum');
const AuditLogs = require('../lib/AuditLogs');
const logger = require('../lib/logger/LoggerClass');
const auth = require('../lib/auth')();

router.all('*',auth.authenticate(), (req, res, next) => {
  next();
});

/* GET users listing. */
router.get('/', async (req, res) => {
    try {
        let categories = await Categories.find();
        res.json(Responce.successResponce(categories));
    } catch (error) {
        let errorResponce = Responce.errorResponce(error);
        res.status(errorResponce.code).json(errorResponce);   
    }
});

/* POST create category */
router.post('/add', async (req, res) => {
    let body = req.body;
    try {
        if(!body.name) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Name is required");

        let newCategory = new Categories({
            name: body.name,
            is_active: true,
            created_by: req.user?.id
        });
        await newCategory.save();

        AuditLogs.info(req.user?.email, "Categories", "Add", newCategory);
        logger.info(req.user?.email, "Categories", "Add", newCategory);

        res.json(Responce.successResponce(newCategory));
    } catch (error) {
        logger.error(req.user?.email, "Categories", "Add", error);
        let errorResponce = Responce.errorResponce(error);
        res.status(errorResponce.code).json(errorResponce);   
    }
});


/* UPDATE category */
router.post('/update/', async (req, res) => {

    let body = req.body;

    try {

        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Category ID is required");
   
        let updates = {};

        if(body.name) updates.name = body.name;
        if(typeof body.is_active === "boolean") updates.is_active = body.is_active;    

        await Categories.updateOne({_id: body._id}, updates);

        AuditLogs.info(req.user?.email, "Categories", "Update", {_id: body._id, ...updates});

        res.json(Responce.successResponce("Category updated successfully!"));
    } catch (error) {
        let errorResponce = Responce.errorResponce(error);
        res.status(errorResponce.code).json(errorResponce);   
    }
});


/* DELETE category */
router.post('/delete/', async (req, res) => {

    let body = req.body;

    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Category ID is required");
        await Categories.deleteOne({_id: body._id});

        AuditLogs.info(req.user?.email, "Categories", "Delete", {_id: body._id});

        res.json(Responce.successResponce("Category deleted successfully!"));
    } catch (error) {
        let errorResponce = Responce.errorResponce(error);
        res.status(errorResponce.code).json(errorResponce);   
    }
});

module.exports = router;