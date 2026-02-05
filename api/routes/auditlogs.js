const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  res.json({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });
});

module.exports = router;