const express = require('express');
const router = express.Router();
const ejs = require('ejs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title : ejs.render('title') });
});

module.exports = router;
