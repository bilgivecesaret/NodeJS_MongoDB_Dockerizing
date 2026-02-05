const express = require('express');
const router = express.Router();        

const isAuthenticated = true;

router.all("*",(req, res, next) => {
  if(!isAuthenticated) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }
  next();
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({success: true, message: "Categories route is working."});
});

module.exports = router;