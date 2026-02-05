var express = require('express');
var router = express.Router();

const fs = require('fs');

let routes = fs.readdirSync(__dirname);

routes = routes.filter(r => r != "index.js" && r.endsWith('.js')).map(r => r.replace('.js',''));
routes.forEach(r => {
  router.use(`/${r}`, require(`./${r}`));
});

module.exports = router;
