const express = require('express');
const router = express.Router();        

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({success: true, message: "Roles route is working."});
});

module.exports = router;