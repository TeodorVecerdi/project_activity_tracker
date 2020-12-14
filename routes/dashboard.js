let express = require('express');
let router = express.Router();
let database = require('../js/Database');
let serverState = require('../js/ServerState');

router.get('/', (req, res, next) => {
    res.render('pages/dashboard', {});
});

module.exports = {url: "/dashboard", router: router};