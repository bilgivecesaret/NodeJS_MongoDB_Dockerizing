const express = require('express');
const router = express.Router();
const AuditLogs = require('../db/models/AuditLogs');
const Reponse = require('../lib/Responce');
const moment = require('moment');

router.post('/', async (req, res) => {
  try {

    let body = req.body;
    let query = {};
    let skip = body.skip;
    let limit = body.limit;

    if(typeof body.skip !== 'numeric'){
      skip = 0;
    }

    if(typeof body.limit !== 'numeric' || body.limit > 500){
      limit = 500;
    }

    if(body.begin_date && body.end_date){
      query.created_at = {
        $gte: moment(body.begin_date),
        $lte: moment(body.end_date)
      };
    }else{
      query.created_at = {
        $gte: moment().subtract(1, 'days').startOf('day'),
        $lte: moment()
      };
    }

      let auditLogs = await AuditLogs.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);

      res.json(Reponse.successResponce(auditLogs));

  } catch (err) {
    let errorResponce = Reponse.errorResponce(err);
    res.status(errorResponce.code).json(errorResponce);
  }
});

module.exports = router;