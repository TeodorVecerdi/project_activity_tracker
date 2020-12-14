let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('pages/index', {});
});

module.exports = {url: "/", router: router};
