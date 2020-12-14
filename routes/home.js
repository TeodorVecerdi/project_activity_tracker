let express = require('express');
let router = express.Router();
let database = require('../js/Database');
let serverState = require('../js/ServerState');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('pages/index', {});
});

module.exports = {url: "/", router: router};
